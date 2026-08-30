import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

describe('Auth Integration Tests (API Layer)', () => {
  let accessToken: string;
  let sessionCookie: string;

  it('POST /api/v1/auth/register - should successfully register user with default CANDIDATE role when omitted', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ramu K',
        email: `ramu_${Date.now()}@gmail.com`,
        password: 'abc123password',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.fullName).toBe('Ramu K');
    expect(res.body.user.role).toBe('CANDIDATE');
    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/register - should successfully register user with explicit EMPLOYER role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Tech Employer',
        email: `employer_${Date.now()}@company.com`,
        password: 'abc123password',
        role: 'EMPLOYER',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('EMPLOYER');
  });

  it('POST /api/v1/auth/register - should reject ADMIN role with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Hacker Admin',
        email: `admin_${Date.now()}@gmail.com`,
        password: 'abc123password',
        role: 'ADMIN',
      });

    expect(res.status).toBe(403);
  });

  it('POST /api/v1/auth/register - should reject invalid role with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Invalid User',
        email: `invalid_${Date.now()}@gmail.com`,
        password: 'abc123password',
        role: 'SUPERUSER',
      });

    expect(res.status).toBe(400);
  });

  it('POST /auth/register - alias route /auth/register should also work', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        fullName: 'Alias User',
        email: `alias_${Date.now()}@gmail.com`,
        password: 'abc123password',
        role: 'CANDIDATE',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('CANDIDATE');
  });

  it('POST /api/v1/auth/register - should throw 400 error if required fullName is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `test_${Date.now()}@gmail.com`,
        password: 'abc123password',
      });

    expect(res.status).toBe(400);
  });

  it('POST /api/v1/auth/register - should throw 400 error if required email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test User',
        password: 'abc123password',
      });

    expect(res.status).toBe(400);
  });


  it('POST /api/v1/auth/login - candidate login (sneha@gmail.com)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sneha@gmail.com',
        password: 'abc123',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('sneha@gmail.com');
    expect(res.body.user.fullName).toBe('Sneha Rajput');
    expect(res.body.accessToken).toBeDefined();

    accessToken = res.body.accessToken;
    const cookies = res.headers['set-cookie'];
    const rawCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    sessionCookie = rawCookie ? rawCookie.split(';')[0] : '';
  });

  it('GET /api/v1/auth/me - fetch profile using Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('sneha@gmail.com');
  });

  it('POST /api/v1/auth/refresh - refresh token using session cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/logout - logout and clear cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [sessionCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
