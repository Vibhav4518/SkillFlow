import { describe, it, expect } from 'vitest';
import { AuthMapper } from '../mappers/auth.mapper.js';

describe('AuthMapper Unit Tests', () => {
  it('toUserResponse - should map user with fullName, phone, and companyId', () => {
    const res = AuthMapper.toUserResponse({
      id: 'usr_1',
      email: 'user@example.com',
      passwordHash: 'hash',
      fullName: 'Arav Sharma',
      role: 'CANDIDATE',
      phone: '+919876543210',
      companyId: 'comp_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(res.fullName).toBe('Arav Sharma');
    expect(res.phone).toBe('+919876543210');
    expect(res.companyId).toBe('comp_1');
  });

  it('toUserResponse - should fallback fullName to email prefix if fullName missing', () => {
    const res = AuthMapper.toUserResponse({
      id: 'usr_2',
      email: 'testuser@example.com',
      passwordHash: 'hash',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    expect(res.fullName).toBe('testuser');
  });
});
