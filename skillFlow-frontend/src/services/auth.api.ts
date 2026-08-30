import { apiFetch } from '@/lib/api';

export const authApi = {
  async login(credentials: { email: string; password: string }) {
    return apiFetch('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: credentials,
    });
  },

  async register(data: { fullName: string; email: string; password: string; role: 'CANDIDATE' | 'EMPLOYER'; companyName?: string; industry?: string; location?: string; websiteUrl?: string }) {
    return apiFetch('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: data,
    });
  },

  async logout() {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  async getMe() {
    return apiFetch('/auth/me');
  },

  async googleLogin(data: { email: string; fullName?: string; photoUrl?: string; role?: string }) {
    return apiFetch('/auth/google', {
      method: 'POST',
      skipAuth: true,
      body: data,
    });
  },

  async forgotPassword(email: string) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      skipAuth: true,
      body: { email },
    });
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      skipAuth: true,
      body: data,
    });
  },
};
