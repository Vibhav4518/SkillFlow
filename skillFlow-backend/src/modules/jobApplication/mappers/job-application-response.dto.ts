export interface JobApplicationResponseDto {
  id: string;
  jobId: string;
  candidateId: string;
  coverLetter?: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
  appliedDate: Date;
}
