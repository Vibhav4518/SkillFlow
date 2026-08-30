import { describe, it, expect } from 'vitest';
import { JobApplicationRepository } from '../repositories/job-application.repository.js';
import { JobApplicationMapper } from '../mappers/job-application.mapper.js';

describe('JobApplicationRepository (Unit Tests)', () => {
  const repo = new JobApplicationRepository();
  let createdId: string;

  it('create - should create and return a new job application entity', async () => {
    const created = await repo.create({
      jobId: 'job_501',
      candidateId: 'js_101',
      resume: 'http://example.com/resume.pdf',
      coverLetter: 'Applying for job position',
    });

    expect(created.id).toBeDefined();
    expect(created.jobId).toBe('job_501');
    expect(created.candidateId).toBe('js_101');
    expect(created.status).toBe('applied');

    createdId = created.id;
  });

  it('findAll - should return list of job applications', async () => {
    const list = await repo.findAll();

    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('findById - should return application entity for existing ID', async () => {
    const found = await repo.findById(createdId);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(createdId);
  });

  it('findById - should return null for non-existent non-UUID ID', async () => {
    const found = await repo.findById('non_existent_999');
    expect(found).toBeNull();
  });

  it('update - should update and return application entity', async () => {
    const updated = await repo.update(createdId, {
      status: 'shortlisted',
    });

    expect(updated.id).toBe(createdId);
    expect(updated.status).toBe('shortlisted');
  });

  it('delete - should delete and return application entity', async () => {
    const deleted = await repo.delete(createdId);

    expect(deleted.id).toBe(createdId);

    const check = await repo.findById(createdId);
    expect(check).toBeNull();
  });

  it('UUID paths - create, findById, update, delete with UUID values fallback safely', async () => {
    const uuidJobId = '123e4567-e89b-12d3-a456-426614174000';
    const uuidCandId = '123e4567-e89b-12d3-a456-426614174001';
    const uuidAppId = '123e4567-e89b-12d3-a456-426614174002';

    const created = await repo.create({ jobId: uuidJobId, candidateId: uuidCandId, coverLetter: 'Cover' });
    expect(created).toBeDefined();

    const found = await repo.findById(uuidAppId);
    expect(found).toBeNull();

    const updated = await repo.update(uuidAppId, { status: 'shortlisted' });
    expect(updated.status).toBe('shortlisted');

    const deleted = await repo.delete(uuidAppId);
    expect(deleted).toBeDefined();
  });

  it('JobApplicationMapper - toEntity and toDto should convert objects correctly', () => {
    const entity1 = JobApplicationMapper.toEntity({
      id: 'app_test1',
      job_id: 'job_1',
      candidate_id: 'cand_1',
      status: 'APPLIED',
      applied_at: new Date(),
      cover_letter: 'Hello',
    });
    expect(entity1.id).toBe('app_test1');
    expect(entity1.jobId).toBe('job_1');

    const dto = JobApplicationMapper.toDto(entity1);
    expect(dto.id).toBe('app_test1');

    const entity2 = JobApplicationMapper.toEntity({
      jobId: 'job_2',
      candidateId: 'cand_2',
      coverLetter: 'Letter',
      resume: 'resume.pdf',
    });
    expect(entity2.jobId).toBe('job_2');
    expect(entity2.coverLetter).toBe('Letter');
  });
});
