import { Topbar } from '../components/shared/Topbar';
import { GroupList } from '../components/groups/GroupList';
import { GroupFormPanel } from '../components/groups/GroupFormPanel';
import { useGroupStore } from '../store/groupStore';
import { useAgentStore } from '../store/agentStore';
import { Plus } from 'lucide-react';
import type { Group } from '../types';

export function GroupsPage() {
  const { groups, selectedGroup, isPanelOpen, openPanel, closePanel, addGroup, updateGroup, deleteGroup } =
    useGroupStore();
  const { agents } = useAgentStore();

  function handleSave(data: Omit<Group, 'id' | 'agentIds'>) {
    if (selectedGroup) {
      updateGroup({ ...selectedGroup, ...data });
    } else {
      addGroup({ ...data, id: `grp-${Date.now()}`, agentIds: [] });
    }
  }

  function handleDelete(id: string) {
    if (confirm('Supprimer ce groupe ?')) deleteGroup(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Groupes"
        subtitle={`${groups.length} groupe${groups.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => openPanel()}
            className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs rounded
              font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Plus size={13} />
            Nouveau groupe
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <GroupList
          groups={groups}
          agents={agents}
          onEdit={(g) => openPanel(g)}
          onDelete={handleDelete}
        />
      </div>

      <GroupFormPanel
        open={isPanelOpen}
        group={selectedGroup}
        onClose={closePanel}
        onSave={handleSave}
      />
    </div>
  );
}
