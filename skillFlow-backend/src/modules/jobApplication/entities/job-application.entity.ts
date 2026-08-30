export class JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  resume?: string | null;
  coverLetter?: string | null;
  status: 'applied' | 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
  appliedDate: Date;

  constructor(
    id: string,
    jobId: string,
    candidateId: string,
    status: 'applied' | 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn' = 'applied',
    appliedDate: Date = new Date(),
    coverLetter?: string | null,
    resume?: string | null,
  ) {
    this.id = id;
    this.jobId = jobId;
    this.candidateId = candidateId;
    this.status = status;
    this.appliedDate = appliedDate;
    this.coverLetter = coverLetter;
    this.resume = resume;
  }
}
