import { SlidePanel } from '../shared/SlidePanel';
import { EnrollmentForm } from './EnrollmentForm';
import { usePolicyStore } from '../../store/policyStore';
import type { Policy } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultPolicyId?: string;
}

export function QuickEnrollPanel({ open, onClose }: Props) {
  const { policies, updatePolicy } = usePolicyStore();

  return (
    <SlidePanel open={open} onClose={onClose} title="Enroller un agent" width={520}>
      <div className="px-5 py-4">
        <EnrollmentForm
          policies={policies}
          onPolicyUpdated={(updated: Policy) => updatePolicy(updated)}
        />
      </div>
    </SlidePanel>
  );
}
