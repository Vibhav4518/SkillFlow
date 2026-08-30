import { apiFetch } from '@/lib/api';

export const candidateApi = {
  // --- Basic Profile ---
  async getProfile() {
    return apiFetch('/candidate/me');
  },

  async getBasicProfile() {
    return apiFetch('/candidate/profile');
  },

  async updateProfile(data: any) {
    return apiFetch('/candidate/profile', { method: 'PATCH', body: data });
  },

  // --- Education ---
  async getEducation() {
    return apiFetch('/candidate/education');
  },

  async addEducation(data: any) {
    return apiFetch('/candidate/education', { method: 'POST', body: data });
  },

  async updateEducation(id: string, data: any) {
    return apiFetch(`/candidate/education/${id}`, { method: 'PATCH', body: data });
  },

  async deleteEducation(id: string) {
    return apiFetch(`/candidate/education/${id}`, { method: 'DELETE' });
  },

  // --- Experience ---
  async getExperiences() {
    return apiFetch('/candidate/experience');
  },

  async addExperience(data: any) {
    return apiFetch('/candidate/experience', { method: 'POST', body: data });
  },

  async updateExperience(id: string, data: any) {
    return apiFetch(`/candidate/experience/${id}`, { method: 'PATCH', body: data });
  },

  async deleteExperience(id: string) {
    return apiFetch(`/candidate/experience/${id}`, { method: 'DELETE' });
  },

  // --- Projects ---
  async getProjects() {
    return apiFetch('/candidate/projects');
  },

  async addProject(data: any) {
    return apiFetch('/candidate/projects', { method: 'POST', body: data });
  },

  async updateProject(id: string, data: any) {
    return apiFetch(`/candidate/projects/${id}`, { method: 'PATCH', body: data });
  },

  async deleteProject(id: string) {
    return apiFetch(`/candidate/projects/${id}`, { method: 'DELETE' });
  },

  // --- Certifications ---
  async getCertifications() {
    return apiFetch('/candidate/certifications');
  },

  async addCertification(data: any) {
    return apiFetch('/candidate/certifications', { method: 'POST', body: data });
  },

  async updateCertification(id: string, data: any) {
    return apiFetch(`/candidate/certifications/${id}`, { method: 'PATCH', body: data });
  },

  async deleteCertification(id: string) {
    return apiFetch(`/candidate/certifications/${id}`, { method: 'DELETE' });
  },

  // --- Languages ---
  async getLanguages() {
    return apiFetch('/candidate/languages');
  },

  async addLanguage(data: any) {
    return apiFetch('/candidate/languages', { method: 'POST', body: data });
  },

  async updateLanguage(id: string, data: any) {
    return apiFetch(`/candidate/languages/${id}`, { method: 'PATCH', body: data });
  },

  async deleteLanguage(id: string) {
    return apiFetch(`/candidate/languages/${id}`, { method: 'DELETE' });
  },

  // --- Skills ---
  async getSkills() {
    return apiFetch('/candidate/skills');
  },

  async assignSkills(skillIds: string[]) {
    return apiFetch('/candidate/skills', { method: 'POST', body: { skillIds } });
  },

  async addSkill(skillId: string) {
    return apiFetch('/candidate/skills', { method: 'POST', body: { skillIds: [skillId] } });
  },

  async deleteSkill(skillId: string) {
    return apiFetch(`/candidate/skills/${skillId}`, { method: 'DELETE' });
  },

  // --- Resume ---
  async getResume() {
    return apiFetch('/candidate/resume');
  },

  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    return apiFetch('/candidate/resume', { method: 'POST', body: formData });
  },

  async deleteResume() {
    return apiFetch('/candidate/resume', { method: 'DELETE' });
  },

  async generateResumePdf() {
    return apiFetch('/candidate/resume/generate', { method: 'POST' });
  },

  // --- Applications ---
  async getApplications() {
    return apiFetch('/candidate/applications');
  },
};
