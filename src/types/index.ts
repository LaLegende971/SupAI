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
