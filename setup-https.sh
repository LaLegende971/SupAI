#!/bin/bash
set -e

SERVER_IP="192.168.1.221"
CERT_DIR="/etc/nginx/ssl/supai"
NGINX_CONF="/etc/nginx/sites-available/supai"

echo "=== SupAI HTTPS Setup ==="

# 1. Installer Nginx
echo "[1/5] Installation de Nginx..."
apt-get install -y nginx openssl

# 2. Générer le certificat auto-signé
echo "[2/5] Génération du certificat SSL..."
mkdir -p "$CERT_DIR"
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout "$CERT_DIR/supai.key" \
  -out "$CERT_DIR/supai.crt" \
  -subj "/CN=$SERVER_IP/O=SupAI/C=FR" \
  -addext "subjectAltName=IP:$SERVER_IP"
chmod 600 "$CERT_DIR/supai.key"

echo "[3/5] Configuration Nginx..."
cat > "$NGINX_CONF" << 'EOF'
# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/ssl/supai/supai.crt;
    ssl_certificate_key /etc/nginx/ssl/supai/supai.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Backend API REST
    location /api/ {
        proxy_pass         http://127.0.0.1:5001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # WebSocket métriques
    location /ws/ {
        proxy_pass         http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
    }

    # Frontend React (SPA)
    location / {
        proxy_pass       http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Fallback SPA pour React Router
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }

    location @fallback {
        proxy_pass http://127.0.0.1:5000;
    }
}
EOF

# 4. Activer la config et désactiver default
echo "[4/5] Activation de la configuration..."
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/supai
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl enable nginx && systemctl restart nginx

# 5. Ouvrir les ports firewall si ufw actif
echo "[5/5] Configuration du firewall..."
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "Ports 80 et 443 ouverts dans ufw."
else
    echo "ufw non actif, firewall ignoré."
fi

echo ""
echo "=== Installation terminée ! ==="
echo "SupAI accessible sur : https://$SERVER_IP"
echo ""
echo "Note : Le navigateur affichera un avertissement SSL la première fois."
echo "Clique sur 'Avancé' puis 'Continuer vers le site' pour accéder à SupAI."
