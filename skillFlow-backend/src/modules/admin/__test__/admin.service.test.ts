import { describe, it, expect, vi } from 'vitest';
import { adminService } from '../services/admin.service.js';
import { prisma } from '../../../infrastructure/database/db.client.js';

describe('AdminService Unit Tests', () => {
  it('should fetch dashboard statistics', async () => {
    vi.spyOn(prisma.user, 'count').mockResolvedValue(10);
    vi.spyOn(prisma.company, 'count').mockResolvedValue(3);
    vi.spyOn(prisma.job, 'count').mockResolvedValue(5);
    vi.spyOn(prisma.jobApplication, 'count').mockResolvedValue(12);
    vi.spyOn(prisma.user, 'findMany').mockResolvedValue([] as any);
    vi.spyOn(prisma.job, 'findMany').mockResolvedValue([] as any);
    vi.spyOn(prisma.jobApplication, 'findMany').mockResolvedValue([] as any);

    const stats = await adminService.getDashboardStats();
    expect(stats.totalUsers).toBe(10);
    expect(stats.totalCompanies).toBe(3);
    expect(stats.activeJobs).toBe(5);
    expect(stats.totalApplications).toBe(12);
  });

  it('should fetch paginated users list', async () => {
    const mockUsers = [{ id: 'user-1', email: 'test@example.com', fullName: 'Test User', role: 'CANDIDATE' }];
    vi.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as any);
    vi.spyOn(prisma.user, 'count').mockResolvedValue(1);

    const res = await adminService.getUsers({ page: 1, limit: 10 });
    expect(res.items).toHaveLength(1);
    expect(res.total).toBe(1);
    expect(res.page).toBe(1);
  });

  it('should verify company status', async () => {
    const mockCompany = { id: 'comp-1', name: 'Acme Corp', verificationStatus: 'VERIFIED' };
    vi.spyOn(prisma.company, 'update').mockResolvedValue(mockCompany as any);

    const res = await adminService.verifyCompany('comp-1', 'VERIFIED');
    expect(res.verificationStatus).toBe('VERIFIED');
  });

  it('should update job status', async () => {
    const mockJob = { id: 'job-1', title: 'Developer', status: 'CLOSED' };
    vi.spyOn(prisma.job, 'update').mockResolvedValue(mockJob as any);

    const res = await adminService.updateJobStatus('job-1', 'CLOSED');
    expect(res.status).toBe('CLOSED');
  });
});
