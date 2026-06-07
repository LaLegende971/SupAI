import { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { PolicyList } from '../components/policies/PolicyList';
import { PolicyFormPanel } from '../components/policies/PolicyFormPanel';
import { QuickEnrollPanel } from '../components/enrollment/QuickEnrollPanel';
import { usePolicyStore } from '../store/policyStore';
import { useGroupStore } from '../store/groupStore';
import type { Policy } from '../types';
import { useAuthStore } from '../store/authStore';

export function PoliciesPage() {
  const isAdmin = useAuthStore((s) => s.role === 'admin');
  const { policies, isPanelOpen, selectedPolicy, openPanel, closePanel, addPolicy, updatePolicy, deletePolicy, load, error } =
    usePolicyStore();
  const { load: loadGroups } = useGroupStore();

  useEffect(() => {
    load();
    loadGroups();
  }, []);

  const [enrollPolicyId, setEnrollPolicyId] = useState<string | undefined>(undefined);
  const [enrollOpen, setEnrollOpen] = useState(false);

  async function handleSave(data: Omit<Policy, 'id' | 'agentCount' | 'enrollmentToken'>) {
    try {
      if (selectedPolicy) {
        await updatePolicy({ ...selectedPolicy, ...data });
      } else {
        await addPolicy({ ...data, enrollmentToken: '' });
      }
      closePanel();
    } catch {
      // error is displayed via store.error
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Supprimer cette politique ?')) {
      try { await deletePolicy(id); } catch { /* affiché via store.error */ }
    }
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
        actions={isAdmin ? (
          <button
            type="button"
            onClick={() => openPanel()}
            className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs rounded
              font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Plus size={13} />
            Nouvelle politique
          </button>
        ) : undefined}
      />

      {error && (
        <div className="mx-6 mt-3 flex items-center gap-2 px-3 py-2 bg-status-offline/10 border border-status-offline/20 rounded text-xs text-status-offline">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="border border-white/10 rounded-md overflow-hidden">
          <PolicyList
            policies={policies}
            onEdit={isAdmin ? (p) => openPanel(p) : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            onEnroll={isAdmin ? handleEnroll : undefined}
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
