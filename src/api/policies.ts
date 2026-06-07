import { USE_MOCK } from '../config';
import { mockPolicies } from '../fixtures/policies';
import { apiClient } from './client';
import type { Policy } from '../types';

export async function fetchPolicies(): Promise<Policy[]> {
  if (USE_MOCK) return mockPolicies;
  const res = await apiClient.get<Policy[]>('/policies');
  return res.data;
}

export async function createPolicy(policy: Omit<Policy, 'id' | 'agentCount'>): Promise<Policy> {
  if (USE_MOCK) return { ...policy, id: `pol-${Date.now()}`, agentCount: 0 };
  const res = await apiClient.post<Policy>('/policies', policy);
  return res.data;
}

export async function updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
  if (USE_MOCK) {
    const existing = mockPolicies.find((p) => p.id === id)!;
    return { ...existing, ...policy };
  }
  const res = await apiClient.put<Policy>(`/policies/${id}`, policy);
  return res.data;
}

export async function deletePolicy(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/policies/${id}`);
}
