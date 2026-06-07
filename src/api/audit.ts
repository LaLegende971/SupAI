import { apiClient } from './client';

export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  ipAddress: string;
  success: boolean;
  details: string;
}

export interface AuditFilters {
  username?: string;
  action?: string;
  resourceType?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchAuditLogs(filters: AuditFilters = {}): Promise<AuditLog[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const res = await apiClient.get<AuditLog[]>('/audit/logs', { params });
  return res.data;
}
