#!/usr/bin/env bash
# SupAI — script d'installation sur serveur de prod
set -e

INSTALL_DIR="/opt/supai"
PORT=5000

echo "==> Installation de SupAI dans $INSTALL_DIR"

# Node.js via nvm si absent
if ! command -v node &>/dev/null; then
  echo "==> Installation de Node.js (via nvm)..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
else
  echo "==> Node.js $(node --version) détecté"
fi

# Assure que npm est dans le PATH (nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Cloner ou mettre à jour le repo
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "==> Mise à jour du dépôt..."
  git -C "$INSTALL_DIR" pull
else
  echo "==> Clonage du dépôt..."
  git clone https://github.com/LaLegende971/SupAI.git "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

echo "==> Installation des dépendances npm..."
npm install --production=false

echo "==> Build de la webapp..."
npm run build

# Servir avec un serveur statique (serve)
if ! command -v serve &>/dev/null && ! [ -f "$HOME/bin/serve" ]; then
  echo "==> Installation de 'serve'..."
  npm install -g serve 2>/dev/null || npm install serve --prefix "$HOME/.local"
fi

echo ""
echo "=============================="
echo " SupAI installé avec succès !"
echo "=============================="
echo ""
echo "Pour démarrer la webapp :"
echo "  cd $INSTALL_DIR && npx serve dist -l $PORT -s"
echo ""
echo "Pour lancer en arrière-plan avec systemd, crée le service :"
echo "  sudo systemctl start supai-frontend"
echo ""
