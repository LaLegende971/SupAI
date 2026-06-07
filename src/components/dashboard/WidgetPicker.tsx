import { BarChart2, Bell, Server, TrendingUp } from 'lucide-react';
import { SlidePanel } from '../shared/SlidePanel';
import type { DashboardWidget, WidgetType, WidgetSize, StatMetric } from '../../types';

interface WidgetTemplate {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: WidgetSize;
  variants?: Array<{ label: string; config: DashboardWidget['config']; title: string }>;
}

const TEMPLATES: WidgetTemplate[] = [
  {
    type: 'stat',
    label: 'Statistique',
    description: 'Compteur unique — total, en ligne, warning ou offline',
    icon: <BarChart2 size={16} />,
    defaultSize: 'sm',
    variants: [
      { label: 'Total assets',    title: 'Assets supervisés', config: { metric: 'total' as StatMetric } },
      { label: 'En ligne',        title: 'En ligne',          config: { metric: 'online' as StatMetric } },
      { label: 'Avertissement',   title: 'Avertissement',     config: { metric: 'warning' as StatMetric } },
      { label: 'Hors ligne',      title: 'Hors ligne',        config: { metric: 'offline' as StatMetric } },
    ],
  },
  {
    type: 'alerts',
    label: 'Dernières alertes',
    description: 'Tableau des alertes récentes avec sévérité',
    icon: <Bell size={16} />,
    defaultSize: 'md',
  },
  {
    type: 'agent-list',
    label: 'Agents en anomalie',
    description: 'Liste des agents en warning ou hors ligne',
    icon: <Server size={16} />,
    defaultSize: 'md',
  },
  {
    type: 'metric-chart',
    label: 'CPU & RAM moyen',
    description: 'Graphique temps réel des métriques moyennes du parc',
    icon: <TrendingUp size={16} />,
    defaultSize: 'lg',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (widget: Omit<DashboardWidget, 'id'>) => void;
}

export function WidgetPicker({ open, onClose, onAdd }: Props) {
  function add(tpl: WidgetTemplate, variant?: NonNullable<WidgetTemplate['variants']>[0]) {
    onAdd({
      type: tpl.type,
      title: variant?.title ?? tpl.label,
      size: tpl.defaultSize,
      config: variant?.config,
    });
    onClose();
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="Ajouter un widget" width={380}>
      <div className="px-5 py-4 space-y-3">
        {TEMPLATES.map((tpl) => (
          <div key={tpl.type} className="border border-white/10 rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-bg-tertiary">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-accent-blue">{tpl.icon}</span>
                <span className="text-sm font-medium text-white/80">{tpl.label}</span>
              </div>
              <p className="text-xs text-white/30">{tpl.description}</p>
            </div>

            {tpl.variants ? (
              <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
                {tpl.variants.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => add(tpl, v)}
                    className="px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5
                      transition-colors text-left bg-bg-secondary"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => add(tpl)}
                className="w-full px-4 py-2.5 text-xs text-accent-blue hover:bg-accent-blue/5
                  transition-colors text-left"
              >
                Ajouter →
              </button>
            )}
          </div>
        ))}
      </div>
    </SlidePanel>
  );
}
