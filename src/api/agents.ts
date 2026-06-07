import { USE_MOCK } from '../config';
import { mockAgents } from '../fixtures/agents';
import { apiClient } from './client';
import type { Agent } from '../types';

export async function fetchAgents(): Promise<Agent[]> {
  if (USE_MOCK) return mockAgents;
  const res = await apiClient.get<Agent[]>('/agents');
  return res.data;
}

export async function fetchAgent(id: string): Promise<Agent> {
  if (USE_MOCK) {
    const agent = mockAgents.find((a) => a.id === id);
    if (!agent) throw new Error('Agent not found');
    return agent;
  }
  const res = await apiClient.get<Agent>(`/agents/${id}`);
  return res.data;
}

export async function restartAgent(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.post(`/agents/${id}/restart`);
}

export async function unenrollAgent(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/agents/${id}`);
}
