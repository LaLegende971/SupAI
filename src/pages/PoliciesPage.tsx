import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { PolicyList } from '../components/policies/PolicyList';
import { PolicyFormPanel } from '../components/policies/PolicyFormPanel';
import { QuickEnrollPanel } from '../components/enrollment/QuickEnrollPanel';
import { usePolicyStore } from '../store/policyStore';
import { useGroupStore } from '../store/groupStore';
import { useEnrollmentStore } from '../store/enrollmentStore';
import type { Policy } from '../types';

export function PoliciesPage() {
  const { policies, isPanelOpen, selectedPolicy, openPanel, closePanel, addPolicy, updatePolicy, deletePolicy, load } =
    usePolicyStore();
  const { load: loadGroups } = useGroupStore();
  const { load: loadTokens } = useEnrollmentStore();

  useEffect(() => {
    load();
    loadGroups();
    loadTokens();
  }, []);

  const [enrollPolicyId, setEnrollPolicyId] = useState<string | undefined>(undefined);
  const [enrollOpen, setEnrollOpen] = useState(false);

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

  function handleEnroll(policyId: string) {
    setEnrollPolicyId(policyId);
    setEnrollOpen(true);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Politiques de collecte"
        subtitle={`${policies.length} politique${policies.length !== 1 ? 's' : ''} configurée${policies.length !== 1 ? 's' : ''}`}
        actions={
          <button
            type="button"
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
            onEnroll={handleEnroll}
          />
        </div>
      </div>

      <PolicyFormPanel
        open={isPanelOpen}
        policy={selectedPolicy}
        onClose={closePanel}
        onSave={handleSave}
      />

      <QuickEnrollPanel
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        defaultPolicyId={enrollPolicyId}
      />
    </div>
  );
}
