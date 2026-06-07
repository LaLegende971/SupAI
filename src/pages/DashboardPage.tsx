import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { DashboardTabs } from '../components/dashboard/DashboardTabs';
import { WidgetGrid } from '../components/dashboard/WidgetGrid';
import { WidgetPicker } from '../components/dashboard/WidgetPicker';
import { useDashboardStore } from '../store/dashboardStore';
import { useMetricsSimulator } from '../hooks/useMetricsSimulator';
import type { DashboardWidget } from '../types';

export function DashboardPage() {
  useMetricsSimulator();

  const {
    dashboards, activeDashboardId, isEditing,
    setActiveDashboard, addDashboard, deleteDashboard,
    addWidget, removeWidget, toggleEditing,
  } = useDashboardStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId) ?? dashboards[0];

  function handleAddWidget(widget: Omit<DashboardWidget, 'id'>) {
    if (activeDashboard) addWidget(activeDashboard.id, widget);
  }

  function handleDelete(id: string) {
    if (confirm('Supprimer ce dashboard ?')) deleteDashboard(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Dashboards"
        subtitle="Vue temps réel de l'infrastructure"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleEditing}
              className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded border transition-colors ${
                isEditing
                  ? 'border-status-online/40 bg-status-online/10 text-status-online'
                  : 'border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              {isEditing ? <Check size={12} /> : <Pencil size={12} />}
              {isEditing ? 'Terminer' : 'Éditer'}
            </button>
          </div>
        }
      />

      {/* Dashboard tabs */}
      <DashboardTabs
        dashboards={dashboards}
        activeId={activeDashboard?.id ?? ''}
        onSelect={setActiveDashboard}
        onAdd={(name) => addDashboard(name)}
        onDelete={handleDelete}
      />

      {/* Widget grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeDashboard && (
          <WidgetGrid
            dashboard={activeDashboard}
            isEditing={isEditing}
            onRemoveWidget={(wid) => removeWidget(activeDashboard.id, wid)}
            onOpenPicker={() => setPickerOpen(true)}
          />
        )}
      </div>

      <WidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddWidget}
      />
    </div>
  );
}
