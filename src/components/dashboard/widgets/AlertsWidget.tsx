import { mockAlerts } from '../../../fixtures/dashboards';
import type { Alert } from '../../../types';

interface Props {
  limit?: number;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function SeverityBadge({ severity }: { severity: Alert['severity'] }) {
  const cfg = severity === 'critical'
    ? { bg: 'bg-status-offline/10', text: 'text-status-offline', label: 'Critique' }
    : { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Warning' };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

export function AlertsWidget({ limit = 8 }: Props) {
  const alerts = mockAlerts.slice(0, limit);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-white/25">
          {alerts.filter((a) => !a.acknowledged).length} non acquittée(s)
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-3 py-2 rounded border ${
              alert.acknowledged
                ? 'border-white/[0.05] bg-white/[0.02] opacity-50'
                : alert.severity === 'critical'
                ? 'border-status-offline/20 bg-status-offline/5'
                : 'border-status-warning/20 bg-status-warning/5'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{alert.host}</p>
              <p className="text-[11px] text-white/35">
                {alert.metric} : {alert.value}% &gt; seuil {alert.threshold}%
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <SeverityBadge severity={alert.severity} />
              <span className="text-[10px] text-white/25">{formatTime(alert.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
