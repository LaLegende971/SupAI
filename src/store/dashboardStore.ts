import { create } from 'zustand';
import type { Dashboard, DashboardWidget } from '../types';
import { mockDashboards } from '../fixtures/dashboards';

interface DashboardStore {
  dashboards: Dashboard[];
  activeDashboardId: string;
  isEditing: boolean;
  setActiveDashboard: (id: string) => void;
  addDashboard: (name: string) => Dashboard;
  renameDashboard: (id: string, name: string) => void;
  deleteDashboard: (id: string) => void;
  addWidget: (dashboardId: string, widget: Omit<DashboardWidget, 'id'>) => void;
  removeWidget: (dashboardId: string, widgetId: string) => void;
  toggleEditing: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboards: mockDashboards,
  activeDashboardId: mockDashboards[0].id,
  isEditing: false,

  setActiveDashboard: (id) => set({ activeDashboardId: id, isEditing: false }),

  addDashboard: (name) => {
    const dashboard: Dashboard = {
      id: `dash-${Date.now()}`,
      name,
      widgets: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ dashboards: [...s.dashboards, dashboard], activeDashboardId: dashboard.id }));
    return dashboard;
  },

  renameDashboard: (id, name) =>
    set((s) => ({
      dashboards: s.dashboards.map((d) => (d.id === id ? { ...d, name } : d)),
    })),

  deleteDashboard: (id) => {
    const { dashboards, activeDashboardId } = get();
    const remaining = dashboards.filter((d) => d.id !== id);
    set({
      dashboards: remaining,
      activeDashboardId: activeDashboardId === id ? (remaining[0]?.id ?? '') : activeDashboardId,
      isEditing: false,
    });
  },

  addWidget: (dashboardId, widget) =>
    set((s) => ({
      dashboards: s.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, widgets: [...d.widgets, { ...widget, id: `w-${Date.now()}` }] }
          : d
      ),
    })),

  removeWidget: (dashboardId, widgetId) =>
    set((s) => ({
      dashboards: s.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, widgets: d.widgets.filter((w) => w.id !== widgetId) }
          : d
      ),
    })),

  toggleEditing: () => set((s) => ({ isEditing: !s.isEditing })),
}));
