import { useEffect } from 'react';
import { Topbar } from '../components/shared/Topbar';
import { PolicyList } from '../components/policies/PolicyList';
import { PolicyFormPanel } from '../components/policies/PolicyFormPanel';
import { usePolicyStore } from '../store/policyStore';
import { Plus } from 'lucide-react';
import type { Policy } from '../types';

export function PoliciesPage() {
  const { policies, isPanelOpen, selectedPolicy, openPanel, closePanel, addPolicy, updatePolicy, deletePolicy, load } =
    usePolicyStore();

  useEffect(() => { load(); }, []);

  async function handleSave(data: Omit<Policy, 'id' | 'agentCount'>) {
    if (selectedPolicy) {
      await updatePolicy({ ...selectedPolicy, ...data });
    } else {
      await addPolicy(data);
    }
    closePanel();
  }

  async function handleDelete(id: string) {
    if (confirm('Supprimer cette politique ?')) await deletePolicy(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Politiques de collecte"
        subtitle={`${policies.length} politique${policies.length !== 1 ? 's' : ''} configurée${policies.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => openPanel()}
            className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs rounded
              font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Plus size={13} />
            Nouvelle politique
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="border border-white/10 rounded-md overflow-hidden">
          <PolicyList
            policies={policies}
            onEdit={(p) => openPanel(p)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <PolicyFormPanel
        open={isPanelOpen}
        policy={selectedPolicy}
        onClose={closePanel}
        onSave={handleSave}
      />
    </div>
  );
}
