import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app.error.js';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      throw new ForbiddenError(`Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
    }

    next();
  };
}

export const RequireRole = requireRole;

