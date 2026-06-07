import type { AgentStatus } from '../../types';

interface Props {
  status: AgentStatus;
}

const config: Record<AgentStatus, { label: string; dot: string; text: string; bg: string }> = {
  online: {
    label: 'En ligne',
    dot: 'bg-status-online',
    text: 'text-status-online',
    bg: 'bg-status-online/10',
  },
  offline: {
    label: 'Hors ligne',
    dot: 'bg-status-offline',
    text: 'text-status-offline',
    bg: 'bg-status-offline/10',
  },
  warning: {
    label: 'Avertissement',
    dot: 'bg-status-warning',
    text: 'text-status-warning',
    bg: 'bg-status-warning/10',
  },
};

export function StatusBadge({ status }: Props) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {c.label}
    </span>
  );
}
