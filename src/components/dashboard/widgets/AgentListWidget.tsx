import { useAgentStore } from '../../../store/agentStore';
import { StatusBadge } from '../../shared/StatusBadge';

export function AgentListWidget() {
  const agents = useAgentStore((s) => s.agents);
  const anomalies = agents.filter((a) => a.status === 'warning' || a.status === 'offline');

  if (anomalies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-status-online/70">Tous les agents sont en ligne</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-1">
      {anomalies.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center justify-between px-3 py-2 rounded border border-white/[0.07] hover:bg-white/[0.03] transition-colors"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">{agent.host}</p>
            <p className="text-[11px] text-white/30 font-mono">{agent.ip}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {agent.status !== 'offline' && (
              <span className="text-[11px] text-white/35">
                CPU {agent.cpu.toFixed(0)}% · RAM {agent.ram.toFixed(0)}%
              </span>
            )}
            <StatusBadge status={agent.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
