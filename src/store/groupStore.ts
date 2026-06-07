import { create } from 'zustand';
import type { Group } from '../types';
import { mockGroups } from '../fixtures/groups';

interface GroupStore {
  groups: Group[];
  selectedGroup: Group | null;
  isPanelOpen: boolean;
  isEditing: boolean;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (id: string) => void;
  openPanel: (group?: Group) => void;
  closePanel: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: mockGroups,
  selectedGroup: null,
  isPanelOpen: false,
  isEditing: false,
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (group) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === group.id ? group : g)),
    })),
  deleteGroup: (id) =>
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) })),
  openPanel: (group) =>
    set({ isPanelOpen: true, selectedGroup: group ?? null, isEditing: !!group }),
  closePanel: () => set({ isPanelOpen: false, selectedGroup: null, isEditing: false }),
}));
