import { create } from 'zustand';
import type { Agent } from '../types';
import { mockAgents } from '../fixtures/agents';
import { USE_MOCK } from '../config';
import { fetchAgents } from '../api/agents';

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  load: () => Promise<void>;
  setAgents: (agents: Agent[]) => void;
  updateAgentMetrics: (id: string, cpu: number, ram: number) => void;
  setSelectedAgent: (agent: Agent | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: USE_MOCK ? mockAgents : [],
  selectedAgent: null,
  loading: false,
  load: async () => {
    if (USE_MOCK) return;
    set({ loading: true });
    try {
      const agents = await fetchAgents();
      set({ agents });
    } finally {
      set({ loading: false });
    }
  },
  setAgents: (agents) => set({ agents }),
  updateAgentMetrics: (id, cpu, ram) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, cpu, ram, lastPush: new Date().toISOString() } : a
      ),
      selectedAgent:
        state.selectedAgent?.id === id
          ? { ...state.selectedAgent, cpu, ram, lastPush: new Date().toISOString() }
          : state.selectedAgent,
    })),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));
