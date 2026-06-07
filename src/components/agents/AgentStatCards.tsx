import { StatCard } from '../shared/StatCard';
import type { Agent } from '../../types';

interface Props {
  agents: Agent[];
}

export function AgentStatCards({ agents }: Props) {
  const total = agents.length;
  const online = agents.filter((a) => a.status === 'online').length;
  const offline = agents.filter((a) => a.status === 'offline').length;
  const warning = agents.filter((a) => a.status === 'warning').length;

  return (
    <div className="flex gap-3">
      <StatCard label="Total" value={total} color="text-white" />
      <StatCard label="En ligne" value={online} color="text-status-online" />
      <StatCard label="Hors ligne" value={offline} color="text-status-offline" />
      <StatCard label="Avertissement" value={warning} color="text-status-warning" />
    </div>
  );
}
