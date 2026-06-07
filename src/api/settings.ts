import { apiClient } from './client';
import type { Settings } from '../types';

interface PgConfig { host: string; port: number; database: string; user: string; password: string }

interface BackendSettings extends Settings {
  pgHost: string;
  pgPort: number;
  pgDatabase: string;
  pgUser: string;
  usingPostgresql: boolean;
}

export async function fetchSettings(): Promise<BackendSettings> {
  const res = await apiClient.get<BackendSettings>('/settings');
  return res.data;
}

export async function saveSettings(data: Partial<Settings>): Promise<BackendSettings> {
  const res = await apiClient.put<BackendSettings>('/settings', data);
  return res.data;
}

export async function testPostgresql(pg: PgConfig): Promise<{ status: string; message: string }> {
  const res = await apiClient.post('/settings/test-postgresql', pg);
  return res.data;
}

export async function migrateToPostgresql(pg: PgConfig): Promise<{ status: string; message: string }> {
  const res = await apiClient.post('/settings/migrate-to-postgresql', pg);
  return res.data;
}

export async function deleteSqlite(): Promise<void> {
  await apiClient.delete('/settings/sqlite');
}
