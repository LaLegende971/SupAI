import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, refresh } from '../api/auth';

interface AuthStore {
  accessToken: string | null;
  username: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  tryRefresh: () => Promise<boolean>;
  setToken: (token: string, username: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  username: null,
  ready: false,

  setToken: (token, username) => set({ accessToken: token, username }),

  login: async (username, password) => {
    const data = await apiLogin(username, password);
    set({ accessToken: data.access_token, username: data.username });
  },

  logout: async () => {
    await apiLogout().catch(() => {});
    set({ accessToken: null, username: null });
  },

  tryRefresh: async () => {
    try {
      const data = await refresh();
      set({ accessToken: data.access_token, username: data.username, ready: true });
      return true;
    } catch {
      set({ accessToken: null, username: null, ready: true });
      return false;
    }
  },
}));
