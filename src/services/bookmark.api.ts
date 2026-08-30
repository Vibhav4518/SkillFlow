import { apiFetch } from '@/lib/api';

export const bookmarkApi = {
  async getBookmarks() {
    return apiFetch('/bookmarks');
  },

  async toggleBookmark(payload: { jobId?: string; applicationId?: string; type?: 'JOB' | 'APPLICATION' }) {
    return apiFetch('/bookmarks/toggle', {
      method: 'POST',
      body: payload,
    });
  },

  async checkBookmark(params: { jobId?: string; applicationId?: string }) {
    const query = new URLSearchParams();
    if (params.jobId) query.append('jobId', params.jobId);
    if (params.applicationId) query.append('applicationId', params.applicationId);
    return apiFetch(`/bookmarks/check?${query.toString()}`);
  },

  async deleteBookmark(id: string) {
    return apiFetch(`/bookmarks/${id}`, {
      method: 'DELETE',
    });
  },
};
