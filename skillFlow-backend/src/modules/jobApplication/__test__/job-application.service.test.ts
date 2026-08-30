import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobApplicationService } from '../services/job-application.service.js';
import { JobApplicationRepository } from '../repositories/job-application.repository.js';
import { JobApplication } from '../entities/job-application.entity.js';

describe('JobApplicationService (Unit Tests)', () => {
  let service: JobApplicationService;
  let mockRepo: JobApplicationRepository;

  const mockApp = new JobApplication(
    'app_9001',
    'job_501',
    'js_101',
    'applied',
    new Date('2026-08-11T12:00:00.000Z'),
    'Applying for Frontend Developer position',
    'http://example.com/my-resume.pdf'
  );

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
    service = new JobApplicationService(mockRepo);
  });

  describe('createJobApplication()', () => {
    it('should delegate application creation to repository with dto payload', async () => {
      const dtoPayload = {
        jobId: 'job_501',
        candidateId: 'js_101',
        resume: 'http://example.com/my-resume.pdf',
        coverLetter: 'Applying for Frontend Developer position',
      };

      vi.mocked(mockRepo.create).mockResolvedValue(mockApp);

      const result = await service.createJobApplication(dtoPayload);

      expect(mockRepo.create).toHaveBeenCalledWith(dtoPayload);
      expect(mockRepo.create).toHaveBeenCalledOnce();
      expect(result.id).toBe('app_9001');
      expect(result.jobId).toBe('job_501');
      expect(result.candidateId).toBe('js_101');
      expect(result.resume).toBe('http://example.com/my-resume.pdf');
      expect(result.coverLetter).toBe('Applying for Frontend Developer position');
      expect(result.status).toBe('applied');
    });
  });

  describe('getAllJobApplications()', () => {
    it('should return all job applications list from repository', async () => {
      vi.mocked(mockRepo.findAll).mockResolvedValue([mockApp]);

      const list = await service.getAllJobApplications();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('app_9001');
    });

    it('should return empty list when no applications exist', async () => {
      vi.mocked(mockRepo.findAll).mockResolvedValue([]);

      const list = await service.getAllJobApplications();

      expect(list).toEqual([]);
    });
  });

  describe('getJobApplicationById()', () => {
    it('should return job application entity for existing ID', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockApp);

      const result = await service.getJobApplicationById('app_9001');

      expect(mockRepo.findById).toHaveBeenCalledWith('app_9001');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('app_9001');
    });

    it('should return null when job application ID does not exist', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      const result = await service.getJobApplicationById('unknown_id');

      expect(mockRepo.findById).toHaveBeenCalledWith('unknown_id');
      expect(result).toBeNull();
    });
  });

  describe('updateJobApplication()', () => {
    it('should delegate application updates to repository', async () => {
      const updateData = { status: 'shortlisted' as const };
      const updatedApp = { ...mockApp, status: 'shortlisted' as const };

      vi.mocked(mockRepo.update).mockResolvedValue(updatedApp);

      const result = await service.updateJobApplication('app_9001', updateData);

      expect(mockRepo.update).toHaveBeenCalledWith('app_9001', updateData);
      expect(result.status).toBe('shortlisted');
    });
  });

  describe('deleteJobApplication()', () => {
    it('should delegate application deletion to repository', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(mockApp);

      const result = await service.deleteJobApplication('app_9001');

      expect(mockRepo.delete).toHaveBeenCalledWith('app_9001');
      expect(result.id).toBe('app_9001');
    });
  });
});
