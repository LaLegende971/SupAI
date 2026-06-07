export type AgentStatus = 'online' | 'offline' | 'warning';

export interface Agent {
  id: string;
  host: string;
  ip: string;
  status: AgentStatus;
  policyId: string;
  groupId: string;
  lastPush: string;
  cpu: number;
  ram: number;
  disk: number;
  os: string;
  version: string;
  uptime: string;
  services: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  pushInterval: 10 | 30 | 60 | 300;
  metrics: string[];
  thresholds: Record<string, number>;
  agentCount: number;
  updateCheckEnabled: boolean;
  updateCheckFrequency: 3600 | 21600 | 86400;
  autoUpdate: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  agentIds: string[];
}

export interface EnrollmentToken {
  id: string;
  token: string;
  host: string;
  policyId: string;
  groupId: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}

export interface Settings {
  serverUrl: string;
  ollamaHost: string;
  ollamaModel: string;
  metricsRetentionDays: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  alertsEnabled: boolean;
}

export type WidgetType = 'stat' | 'alerts' | 'agent-list' | 'metric-chart';
export type WidgetSize = 'sm' | 'md' | 'lg';
export type StatMetric = 'total' | 'online' | 'warning' | 'offline';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  config?: { metric?: StatMetric; limit?: number };
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: string;
}

export interface Alert {
  id: string;
  agentId: string;
  host: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export const AVAILABLE_METRICS = [
  'CPU',
  'RAM',
  'Disk',
  'Network',
  'Windows Services',
  'Event Logs',
  'Processes',
] as const;

export type MetricKey = (typeof AVAILABLE_METRICS)[number];
