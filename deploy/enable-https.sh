#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root'; exit 1; }
domain=lyaguh.site
expected=136.234.74.121
getent ahostsv4 "$domain" | awk '{print $1}' | grep -qx "$expected" || {
    echo "First point the A record for $domain to $expected and wait for DNS propagation."
    exit 1
}
# No redirect yet: keep IP access available before and after issuing the certificate.
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --no-redirect -d "$domain"
nginx -t
systemctl enable --now certbot.timer
curl --fail --silent --show-error "https://$domain/healthz"
