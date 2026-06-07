import type { EnrollmentToken } from '../types';

const now = Date.now();

export const mockTokens: EnrollmentToken[] = [
  {
    id: 'tok-001',
    token: 'supai-enr-a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    host: 'SRV-PROD-WEB02',
    policyId: 'pol-001',
    groupId: 'grp-001',
    createdAt: new Date(now - 3600000).toISOString(),
    expiresAt: new Date(now + 82800000).toISOString(),
    status: 'active',
  },
  {
    id: 'tok-002',
    token: 'supai-enr-b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    host: 'SRV-PROD-APP02',
    policyId: 'pol-002',
    groupId: 'grp-001',
    createdAt: new Date(now - 172800000).toISOString(),
    expiresAt: new Date(now - 86400000).toISOString(),
    status: 'expired',
  },
  {
    id: 'tok-003',
    token: 'supai-enr-c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    host: 'SRV-INFRA-NTP01',
    policyId: 'pol-003',
    groupId: 'grp-002',
    createdAt: new Date(now - 7200000).toISOString(),
    expiresAt: new Date(now + 79200000).toISOString(),
    status: 'used',
  },
  {
    id: 'tok-004',
    token: 'supai-enr-d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    host: 'SRV-PROD-FILE01',
    policyId: 'pol-001',
    groupId: 'grp-001',
    createdAt: new Date(now - 1800000).toISOString(),
    expiresAt: new Date(now + 84600000).toISOString(),
    status: 'active',
  },
];
