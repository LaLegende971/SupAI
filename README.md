# SupAI — Infrastructure Monitor

Interface web d'administration pour la plateforme de monitoring SupAI.

## Stack

- React 18 + TypeScript
- Vite 6
- TailwindCSS 3
- React Router 6
- Zustand (state management)
- Axios (API)
- Lucide React (icônes)

## Développement local

```bash
npm install
npm run dev        # port 5000
```

## Installation sur le serveur (prod)

```bash
# Sur le serveur 192.168.1.220, en tant que supai-root :
curl -fsSL https://raw.githubusercontent.com/LaLegende971/SupAI/main/install.sh | bash
```

Puis lancer le service :

```bash
# Option 1 — Manuel
cd /opt/supai && npx serve dist -l 5000 -s

# Option 2 — Systemd (recommandé)
sudo cp /opt/supai/supai-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable supai-frontend
sudo systemctl start supai-frontend
```

Webapp accessible sur **http://192.168.1.220:5000**

## Configuration

| Fichier | Rôle |
|---|---|
| `src/config.ts` | `USE_MOCK`, URLs API et WebSocket |
| `src/fixtures/` | Données de test mockées |
| `.env` | `VITE_API_URL`, `VITE_WS_URL` |

Pour passer en mode API réelle : `USE_MOCK = false` dans `src/config.ts`.
