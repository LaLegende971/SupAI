import { create } from 'zustand';
import type { Agent } from '../types';
import { mockAgents } from '../fixtures/agents';

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  setAgents: (agents: Agent[]) => void;
  updateAgentMetrics: (id: string, cpu: number, ram: number) => void;
  setSelectedAgent: (agent: Agent | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: mockAgents,
  selectedAgent: null,
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
