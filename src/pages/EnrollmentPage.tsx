import { useEffect } from 'react';
import { Topbar } from '../components/shared/Topbar';
import { EnrollmentForm } from '../components/enrollment/EnrollmentForm';
import { TokenTable } from '../components/enrollment/TokenTable';
import { useEnrollmentStore } from '../store/enrollmentStore';
import { usePolicyStore } from '../store/policyStore';
import { useGroupStore } from '../store/groupStore';
import { generateToken } from '../api/enrollment';
import { useAuthStore } from '../store/authStore';

export function EnrollmentPage() {
  const isAdmin = useAuthStore((s) => s.role === 'admin');
  const { tokens, addToken, revokeToken, load: loadTokens } = useEnrollmentStore();
  const { policies, load: loadPolicies } = usePolicyStore();
  const { groups, load: loadGroups } = useGroupStore();

  useEffect(() => {
    loadTokens();
    loadPolicies();
    loadGroups();
  }, []);

  async function handleGenerate(host: string, policyId: string, groupId: string) {
    const token = await generateToken({ host, policyId, groupId });
    addToken(token);
    return token;
  }

  function handleRevoke(id: string) {
    if (confirm('Révoquer ce token ?')) revokeToken(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Enrollment"
        subtitle="Inscription de nouveaux agents"
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {isAdmin && (
          <EnrollmentForm
            policies={policies}
            groups={groups}
            onGenerate={handleGenerate}
          />
        )}

        <div>
          <h3 className="text-xs text-white/30 uppercase tracking-wide mb-3 font-medium">
            Historique des tokens
          </h3>
          <div className="border border-white/10 rounded-md overflow-hidden">
            <TokenTable
              tokens={tokens}
              policies={policies}
              groups={groups}
              onRevoke={isAdmin ? handleRevoke : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
