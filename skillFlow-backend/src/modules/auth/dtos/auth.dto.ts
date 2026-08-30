import { z } from 'zod';

import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from '../schemas/auth.schema.js';

export enum Role {
  CANDIDATE = 'CANDIDATE',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export type LoginDTO = z.infer<typeof loginSchema>;

export type SigninDTO = LoginDTO;

export type RegisterDTO = z.infer<typeof registerSchema>;

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

export interface AuthUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  companyId?: string;
}

export interface ContractAuthResponse {
  message?: string;
  user: AuthUserResponse;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresIn: number;
}