import { useAgentStore } from '../../../store/agentStore';
import type { StatMetric } from '../../../types';

interface Props {
  title: string;
  metric: StatMetric;
}

const METRIC_CONFIG: Record<StatMetric, { color: string; sub: string }> = {
  total:   { color: 'text-white',          sub: 'agents enregistrés' },
  online:  { color: 'text-status-online',  sub: 'en ligne' },
  warning: { color: 'text-status-warning', sub: 'en avertissement' },
  offline: { color: 'text-status-offline', sub: 'hors ligne' },
};

export function StatWidget({ title, metric }: Props) {
  const agents = useAgentStore((s) => s.agents);
  const counts: Record<StatMetric, number> = {
    total:   agents.length,
    online:  agents.filter((a) => a.status === 'online').length,
    warning: agents.filter((a) => a.status === 'warning').length,
    offline: agents.filter((a) => a.status === 'offline').length,
  };
  const value = counts[metric];
  const { color, sub } = METRIC_CONFIG[metric];

  return (
    <div className="flex flex-col justify-between h-full">
      <p className="text-xs text-white/35 font-medium uppercase tracking-wide">{title}</p>
      <div>
        <p className={`text-[42px] font-semibold leading-none tabular-nums ${color}`}>{value}</p>
        <p className="text-xs text-white/25 mt-1">{sub}</p>
      </div>
    </div>
  );
}
