import { useEffect } from 'react';
import { Topbar } from '../components/shared/Topbar';
import { EnrollmentForm } from '../components/enrollment/EnrollmentForm';
import { usePolicyStore } from '../store/policyStore';
import type { Policy } from '../types';

export function EnrollmentPage() {
  const { policies, load: loadPolicies, updatePolicy } = usePolicyStore();

  useEffect(() => {
    loadPolicies();
  }, []);

  function handlePolicyUpdated(updated: Policy) {
    updatePolicy(updated);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Enrollment"
        subtitle={`${policies.length} politique${policies.length !== 1 ? 's' : ''} — tokens permanents`}
      />
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EnrollmentForm policies={policies} onPolicyUpdated={handlePolicyUpdated} />
      </div>
    </div>
  );
}
