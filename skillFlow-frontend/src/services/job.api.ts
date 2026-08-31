import { apiFetch } from '@/lib/api';

export interface JobFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  categoryId?: string;
  companyId?: string;
  sortBy?: string;
}

export const jobApi = {
  async getJobs(params: JobFilterParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.location) query.append('location', params.location);
    if (params.workType) query.append('workType', params.workType);
    if (params.jobType) query.append('jobType', params.jobType);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.companyId) query.append('companyId', params.companyId);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    return apiFetch(`/jobs?${query.toString()}`, { skipAuth: true });
  },

  async getJobById(id: string) {
    return apiFetch(`/jobs/${id}`, { skipAuth: true });
  },

  async createJob(jobData: any) {
    return apiFetch('/jobs', { method: 'POST', body: jobData });
  },

  async updateJob(id: string, jobData: any) {
    return apiFetch(`/jobs/${id}`, { method: 'PUT', body: jobData });
  },

  async deleteJob(id: string) {
    return apiFetch(`/jobs/${id}`, { method: 'DELETE' });
  },

  async getEmployerJobs(params: { page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    const queryString = query.toString();
    return apiFetch(`/employer/jobs${queryString ? `?${queryString}` : ''}`);
  },
};
