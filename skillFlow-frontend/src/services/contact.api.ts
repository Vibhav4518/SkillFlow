import { apiFetch } from '@/lib/api';

export const contactApi = {
  async submitMessage(data: { name: string; email: string; subject: string; message: string }) {
    return apiFetch('/contact', { method: 'POST', skipAuth: true, body: data });
  },

  async getMessages(params: { page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    return apiFetch(`/contact/messages?${query.toString()}`);
  },

  async updateStatus(id: string, status: 'NEW' | 'READ' | 'RESOLVED') {
    return apiFetch(`/contact/messages/${id}`, { method: 'PATCH', body: { status } });
  },

  async deleteMessage(id: string) {
    return apiFetch(`/contact/messages/${id}`, { method: 'DELETE' });
  },
};
