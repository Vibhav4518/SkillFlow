import { apiFetch } from '@/lib/api';

export const employerApi = {
  async getDashboard() {
    return apiFetch('/employer/dashboard');
  },

  async getProfile() {
    return apiFetch('/employer-profile/me');
  },

  async updateProfile(data: any) {
    return apiFetch('/employer-profile/me', { method: 'PUT', body: data });
  },
};
