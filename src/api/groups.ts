import { USE_MOCK } from '../config';
import { mockGroups } from '../fixtures/groups';
import { apiClient } from './client';
import type { Group } from '../types';

export async function fetchGroups(): Promise<Group[]> {
  if (USE_MOCK) return mockGroups;
  const res = await apiClient.get<Group[]>('/groups');
  return res.data;
}

export async function createGroup(group: Omit<Group, 'id' | 'agentIds'>): Promise<Group> {
  if (USE_MOCK) return { ...group, id: `grp-${Date.now()}`, agentIds: [] };
  const res = await apiClient.post<Group>('/groups', group);
  return res.data;
}

export async function updateGroup(id: string, group: Partial<Group>): Promise<Group> {
  if (USE_MOCK) {
    const existing = mockGroups.find((g) => g.id === id)!;
    return { ...existing, ...group };
  }
  const res = await apiClient.put<Group>(`/groups/${id}`, group);
  return res.data;
}

export async function deleteGroup(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/groups/${id}`);
}
