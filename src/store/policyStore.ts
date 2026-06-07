import { create } from 'zustand';
import type { Policy } from '../types';
import { mockPolicies } from '../fixtures/policies';
import { USE_MOCK } from '../config';
import { fetchPolicies, createPolicy, updatePolicy as apiUpdatePolicy, deletePolicy as apiDeletePolicy } from '../api/policies';

interface PolicyStore {
  policies: Policy[];
  selectedPolicy: Policy | null;
  isPanelOpen: boolean;
  isEditing: boolean;
  loading: boolean;
  load: () => Promise<void>;
  addPolicy: (data: Omit<Policy, 'id' | 'agentCount'>) => Promise<void>;
  updatePolicy: (policy: Policy) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  setSelectedPolicy: (policy: Policy | null) => void;
  openPanel: (policy?: Policy) => void;
  closePanel: () => void;
}

export const usePolicyStore = create<PolicyStore>((set) => ({
  policies: USE_MOCK ? mockPolicies : [],
  selectedPolicy: null,
  isPanelOpen: false,
  isEditing: false,
  loading: false,
  load: async () => {
    if (USE_MOCK) return;
    set({ loading: true });
    try {
      const policies = await fetchPolicies();
      set({ policies });
    } finally {
      set({ loading: false });
    }
  },
  addPolicy: async (data) => {
    if (USE_MOCK) {
      set((state) => ({ policies: [...state.policies, { ...data, id: `pol-${Date.now()}`, agentCount: 0 }] }));
      return;
    }
    const policy = await createPolicy(data);
    set((state) => ({ policies: [...state.policies, policy] }));
  },
  updatePolicy: async (policy) => {
    if (USE_MOCK) {
      set((state) => ({ policies: state.policies.map((p) => (p.id === policy.id ? policy : p)) }));
      return;
    }
    const { id, agentCount: _, ...data } = policy;
    const updated = await apiUpdatePolicy(id, data);
    set((state) => ({ policies: state.policies.map((p) => (p.id === id ? updated : p)) }));
  },
  deletePolicy: async (id) => {
    if (USE_MOCK) {
      set((state) => ({ policies: state.policies.filter((p) => p.id !== id) }));
      return;
    }
    await apiDeletePolicy(id);
    set((state) => ({ policies: state.policies.filter((p) => p.id !== id) }));
  },
  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  openPanel: (policy) =>
    set({ isPanelOpen: true, selectedPolicy: policy ?? null, isEditing: !!policy }),
  closePanel: () => set({ isPanelOpen: false, selectedPolicy: null, isEditing: false }),
}));
