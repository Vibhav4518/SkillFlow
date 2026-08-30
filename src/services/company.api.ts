import { apiFetch } from '@/lib/api';

export const companyApi = {
  async getCompany(id: string) {
    return apiFetch(`/companies/${id}`, { skipAuth: true });
  },

  async updateCompany(id: string, data: any) {
    return apiFetch(`/companies/${id}`, { method: 'PATCH', body: data });
  },

  async getReviews(companyId: string) {
    return apiFetch(`/companies/${companyId}/reviews`, { skipAuth: true });
  },

  async addReview(companyId: string, data: { rating: number; title?: string; review: string }) {
    return apiFetch(`/companies/${companyId}/reviews`, { method: 'POST', body: data });
  },

  async addEmployer(data: { email: string; fullName: string; designation?: string; department?: string; phone?: string; password?: string }) {
    return apiFetch('/companies/employers', { method: 'POST', body: data });
  },

  async getCompanyEmployers() {
    return apiFetch('/companies/employers');
  },

  async toggleEmployerStatus(employerProfileId: string, isActive: boolean) {
    return apiFetch(`/companies/employers/${employerProfileId}/toggle-active`, { method: 'PATCH', body: { isActive } });
  },
};
