import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

describe('JobApplication Integration Tests (API Layer)', () => {
  let createdAppId: string;

  it('POST /api/v1/job-applications - should pass when optional coverLetter & resume are null', async () => {
    const res = await request(app)
      .post('/api/v1/job-applications')
      .send({
        jobId: 'job_501',
        candidateId: 'js_101',
        resume: null,
        coverLetter: null,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();

    createdAppId = res.body.data.id;
  });

  it('POST /api/v1/job-applications - should throw 400 error if required jobId is missing', async () => {
    const res = await request(app)
      .post('/api/v1/job-applications')
      .send({
        candidateId: 'js_101',
      });

    expect(res.status).toBe(400);
  });

  it('GET /api/v1/job-applications - fetch all applications', async () => {
    const res = await request(app).get('/api/v1/job-applications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/job-applications/:id - fetch application by ID', async () => {
    const res = await request(app).get(`/api/v1/job-applications/${createdAppId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdAppId);
  });

  it('PUT /api/v1/job-applications/:id - update application by URL ID', async () => {
    const res = await request(app)
      .put(`/api/v1/job-applications/${createdAppId}`)
      .send({
        status: 'shortlisted',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('shortlisted');
  });

  it('DELETE /api/v1/job-applications/:id - delete application by URL ID', async () => {
    const res = await request(app).delete(`/api/v1/job-applications/${createdAppId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('deleted');
  });

  it('GET /api/v1/job-applications/:id - should return 404 for non-existent application', async () => {
    const res = await request(app).get('/api/v1/job-applications/non_existent_9999');
    expect(res.status).toBe(404);
  });

  it('PUT /api/v1/job-applications - should update using body id or return 400 if missing', async () => {
    const resWithoutId = await request(app).put('/api/v1/job-applications').send({ status: 'shortlisted' });
    expect(resWithoutId.status).toBe(400);

    const resWithId = await request(app).put('/api/v1/job-applications').send({ id: 'app_9001', status: 'shortlisted' });
    expect(resWithId.status).toBe(200);
  });

  it('PATCH /api/v1/job-applications - should update using body id or return 400 if missing', async () => {
    const resWithoutId = await request(app).patch('/api/v1/job-applications').send({ status: 'shortlisted' });
    expect(resWithoutId.status).toBe(400);

    const resWithId = await request(app).patch('/api/v1/job-applications').send({ id: 'app_9001', status: 'shortlisted' });
    expect(resWithId.status).toBe(200);
  });

  it('DELETE /api/v1/job-applications - should delete using query id or return 400 if missing', async () => {
    const resWithoutId = await request(app).delete('/api/v1/job-applications');
    expect(resWithoutId.status).toBe(400);

    const resWithId = await request(app).delete('/api/v1/job-applications?id=app_9001');
    expect(resWithId.status).toBe(200);
  });
});
