import { create } from 'zustand';
import type { Group } from '../types';
import { mockGroups } from '../fixtures/groups';
import { USE_MOCK } from '../config';
import { fetchGroups, createGroup, updateGroup as apiUpdateGroup, deleteGroup as apiDeleteGroup } from '../api/groups';

interface GroupStore {
  groups: Group[];
  selectedGroup: Group | null;
  isPanelOpen: boolean;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addGroup: (data: Omit<Group, 'id' | 'agentIds'>) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  openPanel: (group?: Group) => void;
  closePanel: () => void;
}

async function reload(set: (s: Partial<GroupStore>) => void) {
  const groups = await fetchGroups();
  set({ groups });
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: USE_MOCK ? mockGroups : [],
  selectedGroup: null,
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
      set({ error: 'Impossible de charger les groupes' });
    } finally {
      set({ loading: false });
    }
  },
  addGroup: async (data) => {
    if (USE_MOCK) {
      set((state) => ({ groups: [...state.groups, { ...data, id: `grp-${Date.now()}`, agentIds: [] }] }));
      return;
    }
    set({ loading: true, error: null });
    try {
      await createGroup(data);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la création';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  updateGroup: async (group) => {
    if (USE_MOCK) {
      set((state) => ({ groups: state.groups.map((g) => (g.id === group.id ? group : g)) }));
      return;
    }
    set({ loading: true, error: null });
    try {
      await apiUpdateGroup(group.id, group);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la mise à jour';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  deleteGroup: async (id) => {
    if (USE_MOCK) {
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
      return;
    }
    set({ loading: true, error: null });
    try {
      await apiDeleteGroup(id);
      await reload(set);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erreur lors de la suppression';
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  openPanel: (group) =>
    set({ isPanelOpen: true, selectedGroup: group ?? null, isEditing: !!group }),
  closePanel: () => set({ isPanelOpen: false, selectedGroup: null, isEditing: false }),
}));
