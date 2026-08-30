import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../role.middleware.js';
import { validate } from '../validation.middleware.js';
import { z } from 'zod';

describe('Role & Validation Middlewares', () => {
  it('requireRole - should pass if user has allowed role', () => {
    const middleware = requireRole('admin', 'employer');
    const req: any = { user: { role: 'ADMIN' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('requireRole - should throw UnauthorizedError if user is missing', () => {
    const middleware = requireRole('admin');
    const req: any = {};
    const res: any = {};
    const next = vi.fn();

    expect(() => middleware(req, res, next)).toThrow('User authentication required');
  });

  it('requireRole - should throw ForbiddenError if user role is not allowed', () => {
    const middleware = requireRole('admin');
    const req: any = { user: { role: 'candidate' } };
    const res: any = {};
    const next = vi.fn();

    expect(() => middleware(req, res, next)).toThrow('Access denied');
  });

  it('validate - should pass and call next for valid schema', () => {
    const schema = z.object({ body: z.object({ name: z.string() }) });
    const middleware = validate(schema);
    const req: any = { body: { name: 'Arav' }, params: {}, query: {} };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('validate - should return 400 response for invalid schema', () => {
    const schema = z.object({ body: z.object({ email: z.string().email() }) });
    const middleware = validate(schema);
    const req: any = { body: { email: 'invalid-email' }, params: {}, query: {} };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
      })
    );
  });
});
