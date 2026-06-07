import { LayoutDashboard, PlusCircle } from 'lucide-react';
import { WidgetCard } from './WidgetCard';
import type { Dashboard, DashboardWidget } from '../../types';

interface Props {
  dashboard: Dashboard;
  isEditing: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onOpenPicker: () => void;
}

const SIZE_COLS: Record<string, string> = {
  sm: 'col-span-3',
  md: 'col-span-6',
  lg: 'col-span-12',
};

export function WidgetGrid({ dashboard, isEditing, onRemoveWidget, onOpenPicker }: Props) {
  if (dashboard.widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/20">
        <LayoutDashboard size={40} strokeWidth={1} />
        <p className="text-sm">Ce dashboard est vide</p>
        <button
          onClick={onOpenPicker}
          className="flex items-center gap-2 h-9 px-4 border border-white/10 rounded text-sm
            text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          <PlusCircle size={14} />
          Ajouter un widget
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {dashboard.widgets.map((widget: DashboardWidget) => (
        <div key={widget.id} className={SIZE_COLS[widget.size]}>
          <WidgetCard
            widget={widget}
            isEditing={isEditing}
            onRemove={() => onRemoveWidget(widget.id)}
          />
        </div>
      ))}

      {isEditing && (
        <div className="col-span-3">
          <button
            onClick={onOpenPicker}
            className="w-full h-[130px] border border-dashed border-white/15 rounded-md
              flex flex-col items-center justify-center gap-2 text-white/25
              hover:border-accent-blue/40 hover:text-accent-blue/60 transition-colors"
          >
            <PlusCircle size={20} strokeWidth={1.5} />
            <span className="text-xs">Ajouter un widget</span>
          </button>
        </div>
      )}
    </div>
  );
}
