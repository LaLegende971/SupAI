import { X } from 'lucide-react';
import { StatWidget } from './widgets/StatWidget';
import { AlertsWidget } from './widgets/AlertsWidget';
import { AgentListWidget } from './widgets/AgentListWidget';
import { MetricChartWidget } from './widgets/MetricChartWidget';
import type { DashboardWidget } from '../../types';

interface Props {
  widget: DashboardWidget;
  isEditing: boolean;
  onRemove: () => void;
}

const SIZE_HEIGHTS: Record<string, string> = {
  sm: 'h-[130px]',
  md: 'h-[280px]',
  lg: 'h-[240px]',
};

export function WidgetCard({ widget, isEditing, onRemove }: Props) {
  return (
    <div
      className={`bg-bg-secondary border border-white/10 rounded-md p-4 flex flex-col
        ${SIZE_HEIGHTS[widget.size]} ${isEditing ? 'border-accent-blue/30' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide">{widget.title}</h3>
        {isEditing && (
          <button
            onClick={onRemove}
            className="p-1 text-white/25 hover:text-status-offline rounded transition-colors"
            title="Supprimer le widget"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {widget.type === 'stat' && (
          <StatWidget title={widget.title} metric={widget.config?.metric ?? 'total'} />
        )}
        {widget.type === 'alerts' && (
          <AlertsWidget limit={widget.config?.limit} />
        )}
        {widget.type === 'agent-list' && <AgentListWidget />}
        {widget.type === 'metric-chart' && <MetricChartWidget />}
      </div>
    </div>
  );
}
