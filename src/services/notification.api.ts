import { apiFetch } from '@/lib/api';

export const notificationApi = {
  async getNotifications() {
    return apiFetch('/notifications');
  },

  async markAsRead(id: string) {
    return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead() {
    return apiFetch('/notifications/read-all', { method: 'PATCH' });
  },

  async deleteNotification(id: string) {
    return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
  },
};
