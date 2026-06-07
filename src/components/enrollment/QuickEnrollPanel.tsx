import { SlidePanel } from '../shared/SlidePanel';
import { EnrollmentForm } from './EnrollmentForm';
import { useEnrollmentStore } from '../../store/enrollmentStore';
import { usePolicyStore } from '../../store/policyStore';
import { useGroupStore } from '../../store/groupStore';
import { generateToken } from '../../api/enrollment';
import type { EnrollmentToken } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultPolicyId?: string;
}

export function QuickEnrollPanel({ open, onClose, defaultPolicyId }: Props) {
  const { addToken } = useEnrollmentStore();
  const { policies } = usePolicyStore();
  const { groups } = useGroupStore();

  async function handleGenerate(host: string, policyId: string, groupId: string): Promise<EnrollmentToken> {
    const token = await generateToken({ host, policyId, groupId });
    addToken(token);
    return token;
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="Enroller un agent" width={500}>
      <div className="px-5 py-4">
        {policies.length === 0 || groups.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-white/40">
              {policies.length === 0
                ? 'Créez d\'abord une politique de collecte.'
                : 'Créez d\'abord un groupe d\'agents.'}
            </p>
          </div>
        ) : (
          <EnrollmentForm
            policies={policies}
            groups={groups}
            defaultPolicyId={defaultPolicyId}
            onGenerate={handleGenerate}
          />
        )}
      </div>
    </SlidePanel>
  );
}
