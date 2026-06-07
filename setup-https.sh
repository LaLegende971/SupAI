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
# Zones de rate limiting
# login : max 5 req/min par IP (anti brute-force)
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
# API générale : max 100 req/min par IP
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
# Frontend : max 200 req/min par IP
limit_req_zone $binary_remote_addr zone=frontend:10m rate=200r/m;

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
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # Masquer la version Nginx
    server_tokens off;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss://192.168.1.221; frame-ancestors 'none';" always;

    # Taille max des requêtes (protection upload abusif)
    client_max_body_size 1m;

    # Route login avec rate limiting strict
    location = /api/v1/auth/login {
        limit_req zone=login burst=3 nodelay;
        limit_req_status 429;
        proxy_pass         http://127.0.0.1:5001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Backend API REST
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        proxy_pass         http://127.0.0.1:5001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # WebSocket métriques (pas de rate limiting — connexion persistante)
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
        limit_req zone=frontend burst=50 nodelay;
        proxy_pass       http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

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
    # Bloquer l'accès direct aux ports internes depuis l'extérieur
    ufw deny 5000/tcp
    ufw deny 5001/tcp
    echo "Ports 80/443 ouverts, 5000/5001 bloqués depuis l'extérieur."
else
    echo "ufw non actif, firewall ignoré."
fi

echo ""
echo "=== Installation terminée ! ==="
echo "SupAI accessible sur : https://$SERVER_IP"
echo ""
echo "IMPORTANT : Avant de relancer le backend, configure /opt/supai/backend/.env :"
echo "  JWT_SECRET=<chaine_aleatoire_longue>"
echo "  ADMIN_PASSWORD=<mot_de_passe_fort>"
echo ""
echo "Note : Le navigateur affichera un avertissement SSL la première fois."
echo "Clique sur 'Avancé' puis 'Continuer vers le site'."
