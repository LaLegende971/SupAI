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
  load: () => Promise<void>;
  addGroup: (data: Omit<Group, 'id' | 'agentIds'>) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  openPanel: (group?: Group) => void;
  closePanel: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: USE_MOCK ? mockGroups : [],
  selectedGroup: null,
  isPanelOpen: false,
  isEditing: false,
  loading: false,
  load: async () => {
    if (USE_MOCK) return;
    set({ loading: true });
    try {
      const groups = await fetchGroups();
      set({ groups });
    } finally {
      set({ loading: false });
    }
  },
  addGroup: async (data) => {
    if (USE_MOCK) {
      set((state) => ({ groups: [...state.groups, { ...data, id: `grp-${Date.now()}`, agentIds: [] }] }));
      return;
    }
    const group = await createGroup(data);
    set((state) => ({ groups: [...state.groups, group] }));
  },
  updateGroup: async (group) => {
    if (USE_MOCK) {
      set((state) => ({ groups: state.groups.map((g) => (g.id === group.id ? group : g)) }));
      return;
    }
    const updated = await apiUpdateGroup(group.id, group);
    set((state) => ({ groups: state.groups.map((g) => (g.id === group.id ? updated : g)) }));
  },
  deleteGroup: async (id) => {
    if (USE_MOCK) {
      set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
      return;
    }
    await apiDeleteGroup(id);
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
  },
  openPanel: (group) =>
    set({ isPanelOpen: true, selectedGroup: group ?? null, isEditing: !!group }),
  closePanel: () => set({ isPanelOpen: false, selectedGroup: null, isEditing: false }),
}));
