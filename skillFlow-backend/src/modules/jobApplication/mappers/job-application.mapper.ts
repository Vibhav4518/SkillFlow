import { JobApplication } from '../entities/job-application.entity.js';
import { CreateJobApplicationDto } from '../dtos/create-job-application.dto.js';
import { JobApplicationResponseDto } from '../dtos/job-application-response.dto.js';

export class JobApplicationMapper {
  static toEntity(dto: CreateJobApplicationDto | any): JobApplication {
    if ('id' in dto) {
      const rawStatus = dto.status || 'applied';
      const status = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : 'applied';
      const entity = new JobApplication(
        dto.id,
        dto.job_id || dto.jobId,
        dto.candidate_id || dto.candidateId,
        status as any,
        dto.applied_at || dto.appliedDate || dto.appliedAt || new Date(),
        dto.cover_letter !== undefined ? dto.cover_letter : dto.coverLetter,
        dto.resume || dto.candidate?.resumeUrl
      );
      if (dto.job) (entity as any).job = dto.job;
      if (dto.candidate) (entity as any).candidate = dto.candidate;
      return entity;
    }

    const { jobId, candidateId, resume, coverLetter } = dto;
    const entity = new JobApplication(
      'app_' + Math.random().toString(36).substr(2, 9),
      jobId,
      candidateId || 'js_101',
      'applied',
      new Date(),
      coverLetter,
      resume
    );
    if (dto.job) (entity as any).job = dto.job;
    if (dto.candidate) (entity as any).candidate = dto.candidate;
    return entity;
  }

  static toDto(entity: JobApplication): JobApplicationResponseDto {
    const { id, jobId, candidateId, resume, coverLetter, status, appliedDate } = entity;
    return {
      id,
      jobId,
      candidateId,
      resume,
      coverLetter,
      status: typeof status === 'string' ? status.toLowerCase() : 'applied',
      appliedDate,
      ...((entity as any).job && { job: (entity as any).job }),
      ...((entity as any).candidate && { candidate: (entity as any).candidate }),
      ...((entity as any).statusUpdatedAt && { statusUpdatedAt: (entity as any).statusUpdatedAt }),
      ...((entity as any).withdrawnAt && { withdrawnAt: (entity as any).withdrawnAt }),
    };
  }
}

