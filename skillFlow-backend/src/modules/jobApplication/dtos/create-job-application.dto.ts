export interface CreateJobApplicationDto {
  jobId: string;
  candidateId?: string;
  resume?: string | null;
  coverLetter?: string | null;
}

export interface UpdateJobApplicationDto {
  coverLetter?: string | null;
  resume?: string | null;
  status?: string;
}

export interface UpdateApplicationStatusDto {
  status: string;
}

export interface JobApplicationQueryDto {
  status?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}