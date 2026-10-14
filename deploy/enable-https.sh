#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root'; exit 1; }
domain=lyaguh.site
expected=136.234.74.121
getent ahostsv4 "$domain" | awk '{print $1}' | grep -qx "$expected" || {
    echo "First point the A record for $domain to $expected and wait for DNS propagation."
    exit 1
}
# Certbot installs TLS; redirect only domain traffic so CI can still check the IP.
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --no-redirect -d "$domain"
config=/etc/nginx/sites-available/stoq
backup=/etc/nginx/stoq.before-https-redirect.conf
cp -p "$config" "$backup"
python3 - "$config" <<'PY'
from pathlib import Path
import sys
config = Path(sys.argv[1])
source = config.read_text()
if '# STOQ domain HTTPS redirect' not in source:
    source = '''# STOQ domain HTTPS redirect; keep HTTP by IP available for CI.
map "$scheme:$host" $stoq_https_redirect {
    default 0;
    "http:lyaguh.site" 1;
}

''' + source.replace('server {', '''server {
    if ($stoq_https_redirect) {
        return 301 https://lyaguh.site$request_uri;
    }
''', 1)
    config.write_text(source)
PY
if ! nginx -t; then
    cp -p "$backup" "$config"
    exit 1
fi
systemctl reload nginx
systemctl enable --now certbot.timer
curl --fail --silent --show-error "https://$domain/healthz"
