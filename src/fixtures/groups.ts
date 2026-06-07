import type { Group } from '../types';

export const mockGroups: Group[] = [
  {
    id: 'grp-001',
    name: 'Production',
    description: 'Serveurs de production exposés aux utilisateurs',
    color: '#3fb950',
    agentIds: ['agt-001', 'agt-002', 'agt-003', 'agt-006'],
  },
  {
    id: 'grp-002',
    name: 'Infrastructure',
    description: "Serveurs d'infrastructure interne (DC, backup, réseau)",
    color: '#378ADD',
    agentIds: ['agt-004', 'agt-005'],
  },
];
