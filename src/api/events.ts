import { apiClient } from './client';

export interface AgentEvent {
  id: number;
  timestamp: string;
  agentId: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
}

export async function fetchAgentEvents(agentId: string, limit = 50): Promise<AgentEvent[]> {
  const res = await apiClient.get<AgentEvent[]>('/agent/events', {
    params: { agent_id: agentId, limit },
  });
  return res.data;
}
