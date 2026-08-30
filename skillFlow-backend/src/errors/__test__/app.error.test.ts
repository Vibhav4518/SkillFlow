import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../app.error.js';

describe('AppError Classes Unit Tests', () => {
  it('AppError - should create custom error with status and code', () => {
    const err = new AppError('Server error', 500, 'CUSTOM_CODE');
    expect(err.message).toBe('Server error');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('CUSTOM_CODE');
  });

  it('BadRequestError - should set default message and status 400', () => {
    const err = new BadRequestError();
    expect(err.message).toBe('Bad request');
    expect(err.statusCode).toBe(400);
  });

  it('UnauthorizedError - should set default message and status 401', () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe('Unauthorized access');
    expect(err.statusCode).toBe(401);
  });

  it('ForbiddenError - should set default message and status 403', () => {
    const err = new ForbiddenError();
    expect(err.message).toBe('Access forbidden');
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError - should set default message and status 404', () => {
    const err = new NotFoundError();
    expect(err.message).toBe('Resource not found');
    expect(err.statusCode).toBe(404);
  });

  it('ConflictError - should set default message and status 409', () => {
    const err = new ConflictError();
    expect(err.message).toBe('Resource conflict');
    expect(err.statusCode).toBe(409);
  });
});
