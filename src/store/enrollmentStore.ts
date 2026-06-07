import { create } from 'zustand';
import type { EnrollmentToken } from '../types';
import { mockTokens } from '../fixtures/tokens';

interface EnrollmentStore {
  tokens: EnrollmentToken[];
  addToken: (token: EnrollmentToken) => void;
  revokeToken: (id: string) => void;
}

export const useEnrollmentStore = create<EnrollmentStore>((set) => ({
  tokens: mockTokens,
  addToken: (token) => set((state) => ({ tokens: [token, ...state.tokens] })),
  revokeToken: (id) =>
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, status: 'expired' as const } : t)),
    })),
}));
