import { MoreVertical } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { ProgressBar } from '../shared/ProgressBar';
import type { Agent, Policy } from '../../types';

interface Props {
  agents: Agent[];
  policies: Policy[];
  onSelect: (agent: Agent) => void;
  selectedId?: string;
}

function formatLastPush(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export function AgentTable({ agents, policies, onSelect, selectedId }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Hôte', 'IP', 'Statut', 'Politique', 'Dernier push', 'CPU', 'RAM', 'Version', ''].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-left text-xs font-medium text-white/30 uppercase tracking-wide"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {agents.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-sm text-white/25">
                Aucun agent trouvé
              </td>
            </tr>
          )}
          {agents.map((agent) => {
            const policy = policies.find((p) => p.id === agent.policyId);
            const isSelected = agent.id === selectedId;
            return (
              <tr
                key={agent.id}
                onClick={() => onSelect(agent)}
                className={`border-b border-white/[0.05] cursor-pointer transition-colors ${
                  isSelected ? 'bg-accent-blue/5' : 'hover:bg-white/[0.03]'
                }`}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-white/90">{agent.host}</span>
                </td>
                <td className="px-4 py-3 text-white/50 font-mono text-xs">{agent.ip}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={agent.status} />
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {policy?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs tabular-nums">
                  {agent.status === 'offline' ? (
                    <span className="text-status-offline/70">—</span>
                  ) : (
                    formatLastPush(agent.lastPush)
                  )}
                </td>
                <td className="px-4 py-3 min-w-[100px]">
                  {agent.status === 'offline' ? (
                    <span className="text-white/20 text-xs">—</span>
                  ) : (
                    <ProgressBar value={agent.cpu} />
                  )}
                </td>
                <td className="px-4 py-3 min-w-[100px]">
                  {agent.status === 'offline' ? (
                    <span className="text-white/20 text-xs">—</span>
                  ) : (
                    <ProgressBar value={agent.ram} />
                  )}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{agent.version}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(agent);
                    }}
                    className="p-1 text-white/25 hover:text-white/70 transition-colors rounded"
                  >
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
