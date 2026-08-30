import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { IAuthRepository } from '../repositories/auth.repository.js';
import { PasswordHasher } from '../../../infrastructure/security/password-hasher.js';
import { UnauthorizedError, ConflictError, BadRequestError, ForbiddenError } from '../../../errors/app.error.js';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockAuthRepo: IAuthRepository;

  const mockCandidateUser = {
    id: 'usr_12345',
    email: 'jordan.lee@example.com',
    name: 'Jordan Lee',
    fullName: 'Jordan Lee',
    passwordHash: '$2b$10$eImiTXuWVxfM37uY4JANjO5E/8G5uU.5O4v.XlXwR3K.Jv3v',
    role: 'CANDIDATE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployerUser = {
    id: 'usr_67890',
    email: 'employer@example.com',
    name: 'Alex Employer',
    fullName: 'Alex Employer',
    passwordHash: '$2b$10$eImiTXuWVxfM37uY4JANjO5E/8G5uU.5O4v.XlXwR3K.Jv3v',
    role: 'EMPLOYER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: vi.fn(),
      findUserById: vi.fn(),
      createUser: vi.fn(),
      saveRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
    };
    authService = new AuthService(mockAuthRepo);
  });

  describe('register()', () => {
    it('should default to CANDIDATE role when role is omitted', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(mockAuthRepo.createUser).mockResolvedValue(mockCandidateUser);
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue({} as any);

      const result = await authService.register({
        fullName: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        password: 'password123',
      });

      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'CANDIDATE' })
      );
      expect(result.responsePayload.user.role).toBe('CANDIDATE');
      expect(result.responsePayload.message).toBe('Registration successful');
    });

    it('should register as EMPLOYER when role is explicitly EMPLOYER', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(mockAuthRepo.createUser).mockResolvedValue(mockEmployerUser);
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue({} as any);

      const result = await authService.register({
        fullName: 'Alex Employer',
        email: 'employer@example.com',
        password: 'password123',
        role: 'EMPLOYER',
      });

      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'EMPLOYER' })
      );
      expect(result.responsePayload.user.role).toBe('EMPLOYER');
    });

    it('should throw ForbiddenError (403) when role is ADMIN', async () => {
      await expect(
        authService.register({
          fullName: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN',
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw BadRequestError (400) when role is invalid', async () => {
      await expect(
        authService.register({
          fullName: 'Invalid User',
          email: 'invalid@example.com',
          password: 'password123',
          role: 'SUPERUSER',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError (409) when email already exists', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(mockCandidateUser);

      await expect(
        authService.register({
          fullName: 'Jordan Lee',
          email: 'jordan.lee@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ConflictError);
    });
  });


  describe('login()', () => {
    it('should throw UnauthorizedError if user does not exist', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Str0ngP@ssw0rd!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password does not match', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(mockCandidateUser);
      vi.spyOn(PasswordHasher, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'jordan.lee@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should authenticate candidate user and return access token + session cookie payload', async () => {
      vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(mockCandidateUser);
      vi.mocked(mockAuthRepo.saveRefreshToken).mockResolvedValue({} as any);
      vi.spyOn(PasswordHasher, 'compare').mockResolvedValue(true);

      const result = await authService.login({
        email: 'jordan.lee@example.com',
        password: 'Str0ngP@ssw0rd!',
      });

      expect(result.responsePayload.user.email).toBe('jordan.lee@example.com');
      expect(result.responsePayload.accessToken).toBeDefined();
      expect(result.sessionToken).toBeDefined();
    });
  });

  describe('refreshTokens()', () => {
    it('should throw UnauthorizedError if session token is missing', async () => {
      await expect(authService.refreshTokens(undefined)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token is invalid or revoked', async () => {
      vi.mocked(mockAuthRepo.findRefreshToken).mockResolvedValue({
        id: 'sess_123',
        token: 'invalid_token',
        userId: 'usr_12345',
        expiresAt: new Date(Date.now() - 1000),
        revoked: true,
        createdAt: new Date(),
      });

      await expect(authService.refreshTokens('invalid_token')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getCurrentUser()', () => {
    it('should return user response for valid user ID', async () => {
      vi.mocked(mockAuthRepo.findUserById).mockResolvedValue(mockCandidateUser);

      const user = await authService.getCurrentUser('usr_12345');
      expect(user.id).toBe('usr_12345');
      expect(user.email).toBe('jordan.lee@example.com');
    });

    it('should throw UnauthorizedError if user ID is not found', async () => {
      vi.mocked(mockAuthRepo.findUserById).mockResolvedValue(null);

      await expect(authService.getCurrentUser('invalid_id')).rejects.toThrow(UnauthorizedError);
    });
  });
});
