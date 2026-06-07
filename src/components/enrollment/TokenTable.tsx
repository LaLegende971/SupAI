import { Ban } from 'lucide-react';
import type { EnrollmentToken, Policy, Group } from '../../types';

interface Props {
  tokens: EnrollmentToken[];
  policies: Policy[];
  groups: Group[];
  onRevoke: (id: string) => void;
}

const STATUS_CONFIG = {
  active: { label: 'Actif', dot: 'bg-status-online', text: 'text-status-online', bg: 'bg-status-online/10' },
  used: { label: 'Utilisé', dot: 'bg-white/30', text: 'text-white/40', bg: 'bg-white/5' },
  expired: { label: 'Expiré', dot: 'bg-status-offline', text: 'text-status-offline', bg: 'bg-status-offline/10' },
};

export function TokenTable({ tokens, policies, groups, onRevoke }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Hôte', 'Token', 'Politique', 'Groupe', 'Créé le', 'Expire le', 'Statut', ''].map((col) => (
              <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-white/30 uppercase tracking-wide">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-white/25">
                Aucun token généré
              </td>
            </tr>
          )}
          {tokens.map((t) => {
            const policy = policies.find((p) => p.id === t.policyId);
            const group = groups.find((g) => g.id === t.groupId);
            const s = STATUS_CONFIG[t.status];
            return (
              <tr key={t.id} className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3 font-medium text-white/90">{t.host}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-white/35 max-w-[160px] truncate">
                  {t.token}
                </td>
                <td className="px-4 py-3 text-xs text-white/50">{policy?.name ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-white/50">{group?.name ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-white/40">
                  {new Date(t.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-xs text-white/40">
                  {new Date(t.expiresAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {t.status === 'active' && (
                    <button
                      onClick={() => onRevoke(t.id)}
                      className="p-1.5 text-white/25 hover:text-status-offline rounded transition-colors"
                      title="Révoquer"
                    >
                      <Ban size={13} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
