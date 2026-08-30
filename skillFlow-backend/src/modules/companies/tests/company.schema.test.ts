import {
  describe,
  it,
  expect,
} from 'vitest';

import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamSchema,
  updateCompanyVerificationSchema,
} from '../schemas/company.schema.js';

describe('Company Schema', () => {
  describe('createCompanySchema', () => {
    it('should validate a valid company payload', () => {
      const result = createCompanySchema.safeParse({
        body: {
          name: 'HiLabs Technologies',
          websiteUrl: 'https://example.com',
          logoUrl: 'https://example.com/logo.png',
          description: 'Healthcare technology company',
          location: 'Pune',
          companySize: '100-500',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject company name shorter than 2 characters', () => {
      const result = createCompanySchema.safeParse({
        body: {
          name: 'H',
        },
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid website URL', () => {
      const result = createCompanySchema.safeParse({
        body: {
          name: 'HiLabs',
          websiteUrl: 'invalid-url',
        },
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid logo URL', () => {
      const result = createCompanySchema.safeParse({
        body: {
          name: 'HiLabs',
          logoUrl: 'invalid-logo',
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('updateCompanySchema', () => {
    it('should validate partial company update', () => {
      const result = updateCompanySchema.safeParse({
        body: {
          location: 'Bengaluru',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty update body', () => {
      const result = updateCompanySchema.safeParse({
        body: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe('companyIdParamSchema', () => {
    it('should accept valid company UUID', () => {
      const result = companyIdParamSchema.safeParse({
        params: {
          companyId:
            '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid company UUID', () => {
      const result = companyIdParamSchema.safeParse({
        params: {
          companyId: '123',
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('updateCompanyVerificationSchema', () => {
    it('should accept verified status', () => {
      const result =
        updateCompanyVerificationSchema.safeParse({
          params: {
            companyId:
              '550e8400-e29b-41d4-a716-446655440000',
          },
          body: {
            verificationStatus: 'verified',
          },
        });

      expect(result.success).toBe(true);
    });

    it('should accept pending status', () => {
      const result =
        updateCompanyVerificationSchema.safeParse({
          params: {
            companyId:
              '550e8400-e29b-41d4-a716-446655440000',
          },
          body: {
            verificationStatus: 'pending',
          },
        });

      expect(result.success).toBe(true);
    });

    it('should accept rejected status', () => {
      const result =
        updateCompanyVerificationSchema.safeParse({
          params: {
            companyId:
              '550e8400-e29b-41d4-a716-446655440000',
          },
          body: {
            verificationStatus: 'rejected',
          },
        });

      expect(result.success).toBe(true);
    });

    it('should reject invalid verification status', () => {
      const result =
        updateCompanyVerificationSchema.safeParse({
          params: {
            companyId:
              '550e8400-e29b-41d4-a716-446655440000',
          },
          body: {
            verificationStatus: 'approved',
          },
        });

      expect(result.success).toBe(false);
    });
  });
});