import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { fetchAuditLogs } from '../api/audit';
import type { AuditLog, AuditFilters } from '../api/audit';

const ACTION_LABELS: Record<string, string> = {
  AUTH_LOGIN: 'Connexion',
  AUTH_LOGIN_FAILURE: 'Échec connexion',
  AUTH_LOGOUT: 'Déconnexion',
  POLICY_CREATE: 'Créer politique',
  POLICY_UPDATE: 'Modifier politique',
  POLICY_DELETE: 'Supprimer politique',
  GROUP_CREATE: 'Créer groupe',
  GROUP_UPDATE: 'Modifier groupe',
  GROUP_DELETE: 'Supprimer groupe',
  AGENT_DELETE: 'Supprimer agent',
  AGENT_RESTART: 'Redémarrer agent',
  AGENT_POLICY_CHANGE: 'Changer politique agent',
  ENROLLMENT_TOKEN: 'Token enrollment',
};

const ACTION_COLORS: Record<string, string> = {
  AUTH_LOGIN: 'text-status-online bg-status-online/10',
  AUTH_LOGIN_FAILURE: 'text-status-offline bg-status-offline/10',
  AUTH_LOGOUT: 'text-white/40 bg-white/5',
  POLICY_CREATE: 'text-accent-blue bg-accent-blue/10',
  POLICY_UPDATE: 'text-status-warning bg-status-warning/10',
  POLICY_DELETE: 'text-status-offline bg-status-offline/10',
  GROUP_CREATE: 'text-accent-blue bg-accent-blue/10',
  GROUP_UPDATE: 'text-status-warning bg-status-warning/10',
  GROUP_DELETE: 'text-status-offline bg-status-offline/10',
  AGENT_DELETE: 'text-status-offline bg-status-offline/10',
  AGENT_RESTART: 'text-status-warning bg-status-warning/10',
  AGENT_POLICY_CHANGE: 'text-accent-blue bg-accent-blue/10',
  ENROLLMENT_TOKEN: 'text-accent-blue bg-accent-blue/10',
};

const RESOURCE_LABELS: Record<string, string> = {
  auth: 'Authentification',
  policy: 'Politique',
  group: 'Groupe',
  agent: 'Agent',
  enrollment: 'Enrollment',
  settings: 'Paramètres',
};

const ACTIONS = Object.keys(ACTION_LABELS);
const RESOURCE_TYPES = Object.keys(RESOURCE_LABELS);

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({ limit: 100 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(filters);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function fmt(ts: string) {
    return new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Logs d'audit"
        subtitle={`${logs.length} événement${logs.length !== 1 ? 's' : ''}`}
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3 border border-white/10 text-white/50
              text-xs rounded hover:text-white/80 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        }
      />

      {/* Filtres */}
      <div className="px-6 py-3 border-b border-white/10 flex gap-3 flex-wrap">
        <select
          value={filters.action ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value || undefined, offset: 0 }))}
          className="h-8 px-2 bg-bg-tertiary border border-white/10 rounded text-xs text-white/70
            focus:outline-none focus:border-accent-blue/60"
        >
          <option value="">Toutes les actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>

        <select
          value={filters.resourceType ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, resourceType: e.target.value || undefined, offset: 0 }))}
          className="h-8 px-2 bg-bg-tertiary border border-white/10 rounded text-xs text-white/70
            focus:outline-none focus:border-accent-blue/60"
        >
          <option value="">Tous les types</option>
          {RESOURCE_TYPES.map((r) => (
            <option key={r} value={r}>{RESOURCE_LABELS[r]}</option>
          ))}
        </select>

        <select
          value={filters.success === undefined ? '' : String(filters.success)}
          onChange={(e) => setFilters((f) => ({
            ...f,
            success: e.target.value === '' ? undefined : e.target.value === 'true',
            offset: 0,
          }))}
          className="h-8 px-2 bg-bg-tertiary border border-white/10 rounded text-xs text-white/70
            focus:outline-none focus:border-accent-blue/60"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Succès</option>
          <option value="false">Échec</option>
        </select>

        {(filters.action || filters.resourceType || filters.success !== undefined) && (
          <button
            type="button"
            onClick={() => setFilters({ limit: 100 })}
            className="h-8 px-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {logs.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/20">
            <ShieldAlert size={32} />
            <p className="text-sm">Aucun événement enregistré</p>
          </div>
        ) : (
          <div className="border border-white/10 rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-bg-secondary">
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Utilisateur</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Action</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Ressource</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">IP</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Détails</th>
                  <th className="text-left px-4 py-2.5 text-white/30 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-white/40 font-mono whitespace-nowrap">
                      {fmt(log.timestamp)}
                    </td>
                    <td className="px-4 py-2.5 text-white/70">
                      {log.username || <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${ACTION_COLORS[log.action] ?? 'text-white/40 bg-white/5'}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-white/60">
                      {log.resourceName
                        ? <><span className="text-white/30">{RESOURCE_LABELS[log.resourceType] ?? log.resourceType} · </span>{log.resourceName}</>
                        : <span className="text-white/20">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-white/30 font-mono">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-white/30">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {log.success
                        ? <span className="text-status-online">✓</span>
                        : <span className="text-status-offline">✗</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
