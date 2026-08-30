import { apiFetch } from '@/lib/api';

export const applicationApi = {
  async applyToJob(data: { jobId: string; coverLetter?: string }) {
    return apiFetch('/job-applications', { method: 'POST', body: data });
  },

  async getCandidateApplications() {
    return apiFetch('/candidate/applications');
  },

  async getJobApplications(jobId?: string) {
    if (!jobId || jobId === "ALL") {
      return apiFetch('/job-applications');
    }
    return apiFetch(`/job-applications/job/${jobId}`);
  },

  async updateStatus(applicationId: string, status: string, reason?: string) {
    return apiFetch(`/job-applications/${applicationId}/status`, {
      method: 'PATCH',
      body: { status, reason },
    });
  },

  async withdrawApplication(applicationId: string) {
    return apiFetch(`/job-applications/${applicationId}/withdraw`, { method: 'PATCH' });
  },
};
