import { Pencil, Trash2 } from 'lucide-react';
import type { Group, Agent } from '../../types';

interface Props {
  groups: Group[];
  agents: Agent[];
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
}

export function GroupList({ groups, agents, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {groups.length === 0 && (
        <div className="text-center py-10 text-sm text-white/25">Aucun groupe</div>
      )}
      {groups.map((group) => {
        const members = agents.filter((a) => group.agentIds.includes(a.id));
        const online = members.filter((a) => a.status === 'online').length;

        return (
          <div
            key={group.id}
            className="bg-bg-secondary border border-white/10 rounded-md p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: group.color }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{group.name}</h3>
                  <p className="text-xs text-white/35 mt-0.5">{group.description}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onEdit(group)}
                  className="p-1.5 text-white/30 hover:text-accent-blue rounded transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(group.id)}
                  className="p-1.5 text-white/30 hover:text-status-offline rounded transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/30">
                {members.length} agent{members.length !== 1 ? 's' : ''} •{' '}
                <span className="text-status-online">{online} en ligne</span>
              </span>
            </div>

            {members.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {members.map((a) => (
                  <span
                    key={a.id}
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                      a.status === 'online'
                        ? 'border-status-online/20 text-status-online/70 bg-status-online/5'
                        : a.status === 'warning'
                        ? 'border-status-warning/20 text-status-warning/70 bg-status-warning/5'
                        : 'border-white/10 text-white/30 bg-white/[0.03]'
                    }`}
                  >
                    {a.host}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
