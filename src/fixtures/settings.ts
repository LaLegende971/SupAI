import type { Settings } from '../types';

export const mockSettings: Settings = {
  serverUrl: 'http://192.168.1.220:8000',
  ollamaHost: 'http://192.168.1.220:11434',
  ollamaModel: 'llama3.2',
  metricsRetentionDays: 30,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUser: 'alerts@supai.local',
  smtpFrom: 'SupAI Alerts <alerts@supai.local>',
  alertsEnabled: false,
};
