#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root'; exit 1; }
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx rsync python3 ca-certificates certbot python3-certbot-nginx
id stoq-deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash stoq-deploy
id stoq-tunnel >/dev/null 2>&1 || useradd --create-home --shell /bin/bash stoq-tunnel
# Public-key-only accounts need valid account records; password login is disabled below.
usermod -p '*' stoq-deploy
usermod -p '*' stoq-tunnel
for account in stoq-deploy stoq-tunnel; do
    install -d -m 700 -o "$account" -g "$account" "/home/$account/.ssh"
    touch "/home/$account/.ssh/authorized_keys"
    chown "$account:$account" "/home/$account/.ssh/authorized_keys"
    chmod 600 "/home/$account/.ssh/authorized_keys"
done
install -d -m 755 -o stoq-deploy -g stoq-deploy /var/www/stoq /var/www/stoq/releases /var/www/stoq/incoming /var/www/stoq/shared /var/www/stoq/shared/assets
install -m 755 stoq-deploy.sh /usr/local/bin/stoq-deploy
if [[ ! -f /etc/letsencrypt/live/lyaguh.site/fullchain.pem ]]; then
    install -m 644 nginx.conf /etc/nginx/sites-available/stoq
fi
if [[ -L /etc/nginx/sites-enabled/default ]]; then unlink /etc/nginx/sites-enabled/default; fi
ln -sfn /etc/nginx/sites-available/stoq /etc/nginx/sites-enabled/stoq

cat > /etc/ssh/sshd_config.d/60-stoq.conf <<'EOF'
Match User stoq-deploy
    PasswordAuthentication no
    KbdInteractiveAuthentication no
    AllowTcpForwarding no
    X11Forwarding no
    PermitTTY no
Match User stoq-tunnel
    PasswordAuthentication no
    KbdInteractiveAuthentication no
    AllowTcpForwarding remote
    AllowStreamLocalForwarding no
    GatewayPorts no
    PermitListen 127.0.0.1:13000
    X11Forwarding no
    PermitTTY no
    ForceCommand /usr/sbin/nologin
Match all
EOF
/usr/sbin/sshd -t
nginx -t
systemctl reload ssh
systemctl enable --now nginx
systemctl reload nginx
echo 'Install deployment and tunnel public keys in the corresponding authorized_keys files.'
