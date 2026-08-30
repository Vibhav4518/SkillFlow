import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../infrastructure/security/jwt.service.js';
import { UnauthorizedError } from '../errors/app.error.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = JwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Access token is invalid or expired');
  }
}

export const requireAuth = authGuard;
export const RequireAuth = authGuard;

