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
  error: string | null;
  load: () => Promise<void>;
  addPolicy: (data: Omit<Policy, 'id' | 'agentCount'>) => Promise<void>;
  updatePolicy: (policy: Policy) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  setSelectedPolicy: (policy: Policy | null) => void;
  openPanel: (policy?: Policy) => void;
  closePanel: () => void;
}

async function reload(set: (s: Partial<PolicyStore>) => void) {
  const policies = await fetchPolicies();
  set({ policies });
}

export const usePolicyStore = create<PolicyStore>((set) => ({
  policies: USE_MOCK ? mockPolicies : [],
  selectedPolicy: null,
  isPanelOpen: false,
  isEditing: false,
  loading: false,
  error: null,
  load: async () => {
    if (USE_MOCK) return;
    set({ loading: true, error: null });
    try {
      await reload(set);
    } catch (e) {
      set({ error: 'Impossible de charger les politiques' });
    } finally {
      set({ loading: false });
    }
  },
  addPolicy: async (data) => {
    if (USE_MOCK) {
      set((state) => ({ policies: [...state.policies, { ...data, id: `pol-${Date.now()}`, agentCount: 0 }] }));
      return;
    }
    set({ loading: true, error: null });
    try {
      await createPolicy(data);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la création';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  updatePolicy: async (policy) => {
    if (USE_MOCK) {
      set((state) => ({ policies: state.policies.map((p) => (p.id === policy.id ? policy : p)) }));
      return;
    }
    const { id, agentCount: _, ...data } = policy;
    set({ loading: true, error: null });
    try {
      await apiUpdatePolicy(id, data);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la mise à jour';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  deletePolicy: async (id) => {
    if (USE_MOCK) {
      set((state) => ({ policies: state.policies.filter((p) => p.id !== id) }));
      return;
    }
    set({ loading: true, error: null });
    try {
      await apiDeletePolicy(id);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la suppression';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  openPanel: (policy) =>
    set({ isPanelOpen: true, selectedPolicy: policy ?? null, isEditing: !!policy }),
  closePanel: () => set({ isPanelOpen: false, selectedPolicy: null, isEditing: false }),
}));
