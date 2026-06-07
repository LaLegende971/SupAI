import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent-blue flex items-center justify-center">
            <span className="text-white text-base font-bold">S</span>
          </div>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">SupAI</p>
            <p className="text-white/30 text-xs">Infrastructure Monitor</p>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-white/10 rounded-xl p-6 space-y-4"
        >
          <h1 className="text-sm font-semibold text-white mb-2">Connexion</h1>

          {error && (
            <div className="px-3 py-2 bg-status-offline/10 border border-status-offline/20 rounded text-xs text-status-offline">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              className="w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
                focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full h-9 px-3 bg-bg-tertiary border border-white/10 rounded text-sm text-white/80
                focus:outline-none focus:border-accent-blue/60 placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full h-9 bg-accent-blue text-white text-sm rounded font-medium
              hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
