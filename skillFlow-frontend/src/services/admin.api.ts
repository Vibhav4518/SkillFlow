import { apiFetch } from '@/lib/api';

export const adminApi = {
  async getStats() {
    return apiFetch('/admin/dashboard');
  },

  async getUsers(params: { page?: number; limit?: number; role?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    return apiFetch(`/admin/users?${query.toString()}`);
  },

  async deleteUser(id: string) {
    return apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
  },

  async getCompanies(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return apiFetch(`/admin/companies?${query.toString()}`);
  },

  async verifyCompany(id: string, status: string, rejectionReason?: string) {
    return apiFetch(`/admin/companies/${id}/verify`, { method: 'PATCH', body: { status, rejectionReason } });
  },

  async getJobs(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return apiFetch(`/admin/jobs?${query.toString()}`);
  },

  async updateJobStatus(id: string, status: string) {
    return apiFetch(`/admin/jobs/${id}/status`, { method: 'PATCH', body: { status } });
  },

  async deleteJob(id: string) {
    return apiFetch(`/admin/jobs/${id}`, { method: 'DELETE' });
  },

  async bulkDeleteJobs(ids: string[]) {
    return apiFetch('/admin/jobs/bulk', { method: 'DELETE', body: { ids } });
  },

  async getApplications(params: { page?: number; limit?: number; status?: string; jobId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.jobId) query.append('jobId', params.jobId);
    return apiFetch(`/admin/applications?${query.toString()}`);
  },

  async updateApplicationStatus(id: string, status: string, reason?: string) {
    return apiFetch(`/admin/applications/${id}/status`, { method: 'PATCH', body: { status, reason } });
  },

  async bulkDeleteApplications(ids: string[]) {
    return apiFetch('/admin/applications/bulk', { method: 'DELETE', body: { ids } });
  },

  async getAuditLogs(params: { page?: number; limit?: number; action?: string; entity?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.action) query.append('action', params.action);
    if (params.entity) query.append('entity', params.entity);
    if (params.search) query.append('search', params.search);
    return apiFetch(`/admin/audit-logs?${query.toString()}`);
  },

  async getSkills(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    return apiFetch(`/admin/skills?${query.toString()}`);
  },

  async createSkill(name: string) {
    return apiFetch('/admin/skills', { method: 'POST', body: { name } });
  },

  async updateSkill(id: string, name: string) {
    return apiFetch(`/admin/skills/${id}`, { method: 'PUT', body: { name } });
  },

  async deleteSkill(id: string) {
    return apiFetch(`/admin/skills/${id}`, { method: 'DELETE' });
  },
};

