import { describe, it, expect, vi } from 'vitest';
import { JobApplicationController } from '../controllers/job-application.controller.js';

describe('JobApplicationController (Unit Tests)', () => {
  const controller = new JobApplicationController();

  function createMockResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  }

  it('create - should validate body and return 201 status with created DTO', async () => {
    const req: any = {
      body: {
        jobId: 'job_501',
        candidateId: 'js_101',
        resume: 'http://example.com/resume.pdf',
        coverLetter: 'Applying for job',
      },
    };
    const res = createMockResponse();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Job application created',
        data: expect.objectContaining({ jobId: 'job_501' }),
      })
    );
  });

  it('findAll - should return 200 status with application DTO list', async () => {
    const req: any = {};
    const res = createMockResponse();

    await controller.findAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      })
    );
  });

  it('findById - should return 200 status with application DTO', async () => {
    const req: any = { params: { id: 'app_9001' } };
    const res = createMockResponse();

    await controller.findById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'app_9001' }),
      })
    );
  });

  it('update - should return 200 status with updated DTO', async () => {
    const req: any = {
      params: { id: 'app_9001' },
      body: { status: 'shortlisted' },
    };
    const res = createMockResponse();

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Job application updated',
      })
    );
  });

  it('delete - should return 200 status with deleted DTO message', async () => {
    const req: any = { params: { id: 'app_9001' } };
    const res = createMockResponse();

    await controller.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Job application deleted',
      })
    );
  });
});
