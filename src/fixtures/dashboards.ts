import type { Dashboard, Alert } from '../types';

export const mockDashboards: Dashboard[] = [
  {
    id: 'dash-default',
    name: 'Vue générale',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    widgets: [
      { id: 'w-1', type: 'stat', title: 'Assets supervisés', size: 'sm', config: { metric: 'total' } },
      { id: 'w-2', type: 'stat', title: 'En ligne', size: 'sm', config: { metric: 'online' } },
      { id: 'w-3', type: 'stat', title: 'Avertissement', size: 'sm', config: { metric: 'warning' } },
      { id: 'w-4', type: 'stat', title: 'Hors ligne', size: 'sm', config: { metric: 'offline' } },
      { id: 'w-5', type: 'metric-chart', title: 'CPU & RAM moyen du parc', size: 'lg' },
      { id: 'w-6', type: 'alerts', title: 'Dernières alertes', size: 'md', config: { limit: 8 } },
      { id: 'w-7', type: 'agent-list', title: 'Agents en anomalie', size: 'md' },
    ],
  },
];

const now = Date.now();

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    agentId: 'agt-003',
    host: 'SRV-PROD-APP01',
    metric: 'CPU',
    value: 88,
    threshold: 75,
    severity: 'critical',
    timestamp: new Date(now - 120000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-002',
    agentId: 'agt-002',
    host: 'SRV-PROD-DB01',
    metric: 'RAM',
    value: 84,
    threshold: 80,
    severity: 'warning',
    timestamp: new Date(now - 300000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-003',
    agentId: 'agt-003',
    host: 'SRV-PROD-APP01',
    metric: 'Disk',
    value: 82,
    threshold: 85,
    severity: 'warning',
    timestamp: new Date(now - 600000).toISOString(),
    acknowledged: true,
  },
  {
    id: 'alert-004',
    agentId: 'agt-005',
    host: 'SRV-INFRA-BACKUP',
    metric: 'Agent',
    value: 0,
    threshold: 1,
    severity: 'critical',
    timestamp: new Date(now - 1800000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-005',
    agentId: 'agt-002',
    host: 'SRV-PROD-DB01',
    metric: 'CPU',
    value: 79,
    threshold: 75,
    severity: 'warning',
    timestamp: new Date(now - 3600000).toISOString(),
    acknowledged: true,
  },
  {
    id: 'alert-006',
    agentId: 'agt-003',
    host: 'SRV-PROD-APP01',
    metric: 'RAM',
    value: 79,
    threshold: 80,
    severity: 'warning',
    timestamp: new Date(now - 7200000).toISOString(),
    acknowledged: true,
  },
];
