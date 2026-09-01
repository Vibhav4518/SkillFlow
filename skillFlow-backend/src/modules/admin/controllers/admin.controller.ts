import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { adminService } from '../services/admin.service.js';

function getAdminIdentifier(req: AuthenticatedRequest): string {
  const u = req.user as any;
  return u?.fullName || u?.email || u?.userId || u?.sub || 'Admin';
}

export const adminController = {
  async getDashboardStats(_req: AuthenticatedRequest, res: Response) {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  },

  async getUsers(req: AuthenticatedRequest, res: Response) {
    const users = await adminService.getUsers(req.query as any);
    res.status(200).json({ success: true, data: users });
  },

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    await adminService.deleteUser(id, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  },

  async createAdmin(req: AuthenticatedRequest, res: Response) {
    const newAdmin = await adminService.createAdmin(req.body, getAdminIdentifier(req));
    res.status(201).json({ success: true, message: 'Admin account created successfully', data: newAdmin });
  },

  async updateUser(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    const updated = await adminService.updateUser(id, req.body, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'User updated successfully', data: updated });
  },

  async getCompanies(req: AuthenticatedRequest, res: Response) {
    const companies = await adminService.getCompanies(req.query as any);
    res.status(200).json({ success: true, data: companies });
  },

  async verifyCompany(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    const { status, rejectionReason } = req.body;
    const updated = await adminService.verifyCompany(id, status, rejectionReason, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Company status updated', data: updated });
  },

  async deleteCompany(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    await adminService.deleteCompany(id, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Company deleted successfully' });
  },

  async bulkDeleteCompanies(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of company ids required' });
    }
    const result = await adminService.bulkDeleteCompanies(ids, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: `Successfully deleted ${result.count} companies.` });
  },

  async getJobs(req: AuthenticatedRequest, res: Response) {
    const jobs = await adminService.getJobs(req.query as any);
    res.status(200).json({ success: true, data: jobs });
  },

  async updateJobStatus(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await adminService.updateJobStatus(id, status, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Job status updated', data: updated });
  },

  async deleteJob(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    await adminService.deleteJob(id, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  },

  async bulkDeleteJobs(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of job ids required' });
    }
    const result = await adminService.bulkDeleteJobs(ids, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: `Successfully deleted ${result.count} jobs.` });
  },

  async getApplications(req: AuthenticatedRequest, res: Response) {
    const applications = await adminService.getApplications(req.query as any);
    res.status(200).json({ success: true, data: applications });
  },

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    const { status, reason } = req.body;
    const adminId = getAdminIdentifier(req);
    const updated = await adminService.updateApplicationStatus(id, status, adminId, reason);
    res.status(200).json({ success: true, message: 'Application status updated', data: updated });
  },

  async bulkDeleteApplications(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of application ids required' });
    }
    const result = await adminService.bulkDeleteApplications(ids, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: `Successfully deleted ${result.count} applications.` });
  },

  async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    const logs = await adminService.getAuditLogs(req.query as any);
    res.status(200).json({ success: true, data: logs });
  },

  async getSkills(req: AuthenticatedRequest, res: Response) {
    const skills = await adminService.getSkills(req.query as any);
    res.status(200).json({ success: true, data: skills });
  },

  async createSkill(req: AuthenticatedRequest, res: Response) {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }
    const skill = await adminService.createSkill(name, getAdminIdentifier(req));
    res.status(201).json({ success: true, message: 'Skill created successfully', data: skill });
  },

  async updateSkill(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }
    const skill = await adminService.updateSkill(id, name, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Skill updated successfully', data: skill });
  },

  async deleteSkill(req: AuthenticatedRequest, res: Response) {
    const id = req.params.id as string;
    await adminService.deleteSkill(id, getAdminIdentifier(req));
    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  }
};

