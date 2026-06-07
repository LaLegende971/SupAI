import { create } from 'zustand';
import type { Policy } from '../types';
import { mockPolicies } from '../fixtures/policies';

interface PolicyStore {
  policies: Policy[];
  selectedPolicy: Policy | null;
  isPanelOpen: boolean;
  isEditing: boolean;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (policy: Policy) => void;
  deletePolicy: (id: string) => void;
  setSelectedPolicy: (policy: Policy | null) => void;
  openPanel: (policy?: Policy) => void;
  closePanel: () => void;
}

export const usePolicyStore = create<PolicyStore>((set) => ({
  policies: mockPolicies,
  selectedPolicy: null,
  isPanelOpen: false,
  isEditing: false,
  addPolicy: (policy) =>
    set((state) => ({ policies: [...state.policies, policy] })),
  updatePolicy: (policy) =>
    set((state) => ({
      policies: state.policies.map((p) => (p.id === policy.id ? policy : p)),
    })),
  deletePolicy: (id) =>
    set((state) => ({ policies: state.policies.filter((p) => p.id !== id) })),
  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  openPanel: (policy) =>
    set({ isPanelOpen: true, selectedPolicy: policy ?? null, isEditing: !!policy }),
  closePanel: () => set({ isPanelOpen: false, selectedPolicy: null, isEditing: false }),
}));
