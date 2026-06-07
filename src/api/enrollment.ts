import { USE_MOCK } from '../config';
import { mockTokens } from '../fixtures/tokens';
import { apiClient } from './client';
import type { EnrollmentToken } from '../types';

export async function fetchTokens(): Promise<EnrollmentToken[]> {
  if (USE_MOCK) return mockTokens;
  const res = await apiClient.get<EnrollmentToken[]>('/enrollment/tokens');
  return res.data;
}

export async function generateToken(params: {
  host: string;
  policyId: string;
  groupId: string;
}): Promise<EnrollmentToken> {
  if (USE_MOCK) {
    const now = new Date();
    return {
      id: `tok-${Date.now()}`,
      token: `supai-enr-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      host: params.host,
      policyId: params.policyId,
      groupId: params.groupId,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 86400000).toISOString(),
      status: 'active',
    };
  }
  const res = await apiClient.post<EnrollmentToken>('/enrollment/token', params);
  return res.data;
}
