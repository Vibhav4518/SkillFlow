import { describe, it, expect } from 'vitest';
import { AuthRepository } from '../repositories/auth.repository.js';

describe('AuthRepository (Unit Tests)', () => {
  const authRepo = new AuthRepository();

  it('findUserByEmail - should return pre-seeded candidate user', async () => {
    const user = await authRepo.findUserByEmail('sneha@gmail.com');

    expect(user).not.toBeNull();
    expect(user?.email).toBe('sneha@gmail.com');
    expect(user?.role).toBe('CANDIDATE');
  });

  it('findUserById - should return pre-seeded employer user', async () => {
    const user = await authRepo.findUserById('emp_67890');

    expect(user).not.toBeNull();
    expect(user?.id).toBe('emp_67890');
    expect(user?.email).toBe('avery.patel@company.com');
    expect(user?.role).toBe('EMPLOYER');
  });

  it('saveRefreshToken & findRefreshToken - should save and retrieve session token', async () => {
    const token = 'test_refresh_token_123';
    const expiresAt = new Date(Date.now() + 86400000);

    const saved = await authRepo.saveRefreshToken('usr_sneha', token, expiresAt);
    expect(saved.token).toBe(token);

    const found = await authRepo.findRefreshToken(token);
    expect(found).not.toBeNull();
    expect(found?.token).toBe(token);
  });

  it('revokeRefreshToken - should mark refresh token as revoked', async () => {
    const token = 'revoke_test_token';
    await authRepo.saveRefreshToken('usr_sneha', token, new Date());
    await authRepo.revokeRefreshToken(token);

    const found = await authRepo.findRefreshToken(token);
    expect(found?.revoked).toBe(true);
  });
});
