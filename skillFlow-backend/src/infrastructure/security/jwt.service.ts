import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';

export interface TokenPayload {
  sub?: string;
  userId: string;
  email: string;
  role: string;
  type?: string;
}

export class JwtService {
  static generateAccessToken(payload: TokenPayload): string {
    const tokenPayload = {
      sub: payload.sub || payload.userId,
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role || 'CANDIDATE',
      ...(payload.type ? { type: payload.type } : {}),
    };
    return jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    const tokenPayload = {
      sub: payload.sub || payload.userId,
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    if (!decoded.userId && decoded.sub) {
      decoded.userId = decoded.sub;
    }
    if (!decoded.sub && decoded.userId) {
      decoded.sub = decoded.userId;
    }
    return decoded;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    if (!decoded.userId && decoded.sub) {
      decoded.userId = decoded.sub;
    }
    if (!decoded.sub && decoded.userId) {
      decoded.sub = decoded.userId;
    }
    return decoded;
  }
}

