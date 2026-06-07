import { Pencil, Trash2, Users, UserPlus } from 'lucide-react';
import type { Policy } from '../../types';

interface Props {
  policies: Policy[];
  onEdit: (policy: Policy) => void;
  onDelete: (id: string) => void;
  onEnroll: (policyId: string) => void;
}

const INTERVAL_LABELS: Record<number, string> = {
  10: '10 s',
  30: '30 s',
  60: '1 min',
  300: '5 min',
};

export function PolicyList({ policies, onEdit, onDelete, onEnroll }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Nom', 'Description', 'Fréquence', 'Métriques', 'Agents', ''].map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-xs font-medium text-white/30 uppercase tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/25">
                Aucune politique
              </td>
            </tr>
          )}
          {policies.map((policy) => (
            <tr
              key={policy.id}
              className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-4 py-3 font-medium text-white/90">{policy.name}</td>
              <td className="px-4 py-3 text-white/40 text-xs max-w-[200px] truncate">
                {policy.description}
              </td>
              <td className="px-4 py-3 text-white/50 text-xs">
                {INTERVAL_LABELS[policy.pushInterval]}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {policy.metrics.slice(0, 3).map((m) => (
                    <span
                      key={m}
                      className="px-1.5 py-0.5 bg-bg-tertiary border border-white/10 rounded text-[11px] text-white/50"
                    >
                      {m}
                    </span>
                  ))}
                  {policy.metrics.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[11px] text-white/30">
                      +{policy.metrics.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Users size={12} className="text-white/25" />
                  {policy.agentCount}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEnroll(policy.id)}
                    className="p-1.5 text-white/30 hover:text-status-online rounded transition-colors"
                    title="Enroller un agent avec cette politique"
                  >
                    <UserPlus size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(policy)}
                    className="p-1.5 text-white/30 hover:text-accent-blue rounded transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(policy.id)}
                    className="p-1.5 text-white/30 hover:text-status-offline rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
