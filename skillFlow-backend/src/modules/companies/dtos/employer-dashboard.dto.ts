export interface EmployerDashboardStatsDTO {
  activeJobs: number;
  publishedJobs?: number;
  draftJobs?: number;
  closedJobs?: number;
  totalJobs: number;
  totalApplications: number;
  appliedApplications?: number;
  inProgressApplications: number;
  shortlistedApplications?: number;
  interviewApplications?: number;
  selectedApplications: number;
  rejectedApplications: number;
  withdrawnApplications?: number;
}

export interface EmployerJobsQueryDTO {
  status?: string;
  page?: number;
  limit?: number;
}

export interface EmployerApplicationsQueryDTO {
  jobId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EmployerCandidatesQueryDTO {
  skill?: string;
  location?: string;
  experience?: number;
  page?: number;
  limit?: number;
}
