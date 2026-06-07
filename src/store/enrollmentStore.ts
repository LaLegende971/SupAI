import { create } from 'zustand';
import type { EnrollmentToken } from '../types';
import { mockTokens } from '../fixtures/tokens';
import { USE_MOCK } from '../config';
import { fetchTokens } from '../api/enrollment';

interface EnrollmentStore {
  tokens: EnrollmentToken[];
  loading: boolean;
  load: () => Promise<void>;
  addToken: (token: EnrollmentToken) => void;
  revokeToken: (id: string) => void;
}

export const useEnrollmentStore = create<EnrollmentStore>((set) => ({
  tokens: USE_MOCK ? mockTokens : [],
  loading: false,
  load: async () => {
    if (USE_MOCK) return;
    set({ loading: true });
    try {
      const tokens = await fetchTokens();
      set({ tokens });
    } finally {
      set({ loading: false });
    }
  },
  addToken: (token) => set((state) => ({ tokens: [token, ...state.tokens] })),
  revokeToken: (id) =>
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, status: 'expired' as const } : t)),
    })),
}));
