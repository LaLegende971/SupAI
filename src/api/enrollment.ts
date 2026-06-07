import { apiClient } from './client';
import type { Policy } from '../types';

export async function regeneratePolicyToken(policyId: string): Promise<Policy> {
  const res = await apiClient.post<Policy>(`/policies/${policyId}/token/regenerate`);
  return res.data;
}
