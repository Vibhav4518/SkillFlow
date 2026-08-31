import { prisma } from '../../../infrastructure/database/db.client.js';
import { notificationsService } from '../../notifications/notifications.service.js';
import bcrypt from 'bcrypt';

export const adminService = {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalAdmins,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      appliedApplications,
      inProgressApplications,
      shortlistedApplications,
      interviewApplications,
      selectedCandidates,
      rejectedApplications,
      withdrawnApplications,
      applicationsToday,
      contactMessagesCount,
      notificationsCount,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { deletedAt: null, verificationStatus: 'VERIFIED' } }),
      prisma.company.count({ where: { deletedAt: null, verificationStatus: 'PENDING' } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.job.count({ where: { status: 'DRAFT', deletedAt: null } }),
      prisma.job.count({ where: { status: 'CLOSED', deletedAt: null } }),
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: 'APPLIED' } }),
      prisma.jobApplication.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.jobApplication.count({ where: { status: 'SHORTLISTED' } }),
      prisma.jobApplication.count({ where: { status: 'INTERVIEW' } }),
      prisma.jobApplication.count({ where: { status: 'SELECTED' } }),
      prisma.jobApplication.count({ where: { status: 'REJECTED' } }),
      prisma.jobApplication.count({ where: { status: 'WITHDRAWN' } }),
      prisma.jobApplication.count({ where: { appliedAt: { gte: today } } }),
      prisma.contactMessage.count(),
      prisma.notification.count(),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, email: true, role: true, createdAt: true } }),
      prisma.job.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { company: true } }),
      prisma.jobApplication.findMany({ take: 5, orderBy: { appliedAt: 'desc' }, include: { job: { include: { company: true } }, candidate: { include: { user: true } } } }),
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalAdmins,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalJobs,
      activeJobs: publishedJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      applied: appliedApplications,
      inProgress: inProgressApplications,
      shortlisted: shortlistedApplications,
      interview: interviewApplications,
      inProgressApplications,
      applicationsToday,
      selectedCandidates,
      selected: selectedCandidates,
      rejectedApplications,
      rejected: rejectedApplications,
      withdrawn: withdrawnApplications,
      contactMessages: contactMessagesCount,
      notifications: notificationsCount,
      recentUsers,
      recentJobs,
      recentApplications,
    };
  },

  async getUsers(query: { page?: number; limit?: number; role?: string; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role as any;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          candidateProfile: { select: { id: true, headline: true, location: true } },
          employerProfile: { select: { id: true, designation: true, company: { select: { id: true, name: true } } } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async deleteUser(userId: string) {
    const res = await prisma.user.delete({ where: { id: userId } });
    await this.logAudit({ action: "USER_DELETED", entity: "User", entityId: userId });
    return res;
  },

  async createAdmin(data: { fullName: string; email: string; password?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error("User with this email already exists");
    }
    const passwordHash = await bcrypt.hash(data.password || "Admin@12345", 10);
    const created = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: "ADMIN" as any,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
    await this.logAudit({ action: "ADMIN_CREATED", entity: "User", entityId: created.id });
    return created;
  },

  async updateUser(userId: string, data: { fullName?: string; email?: string; role?: string }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role as any }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
    await this.logAudit({ action: "USER_UPDATED", entity: "User", entityId: userId });
    return updated;
  },

  async bulkDeleteJobs(jobIds: string[]) {
    await prisma.job.deleteMany({
      where: { id: { in: jobIds } },
    });
    await this.logAudit({ action: "BULK_JOBS_DELETED", entity: "Job", entityId: jobIds.join(",") });
    return { count: jobIds.length };
  },

  async bulkDeleteApplications(applicationIds: string[]) {
    await prisma.jobApplication.deleteMany({
      where: { id: { in: applicationIds } },
    });
    await this.logAudit({ action: "BULK_APPLICATIONS_DELETED", entity: "JobApplication", entityId: applicationIds.join(",") });
    return { count: applicationIds.length };
  },

  async getCompanies(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.verificationStatus = query.status as any;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { jobs: true, employers: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async verifyCompany(id: string, status: any, rejectionReason?: string) {
    const normStatus = String(status).toUpperCase();
    const targetStatus = normStatus === "APPROVED" ? "APPROVED" : normStatus === "VERIFIED" ? "VERIFIED" : normStatus === "SUSPENDED" ? "SUSPENDED" : normStatus === "REJECTED" ? "REJECTED" : "PENDING";
    const updated = await prisma.company.update({
      where: { id },
      data: {
        verificationStatus: targetStatus as any,
        rejectionReason: targetStatus === "REJECTED" ? (rejectionReason || "Verification details did not meet criteria.") : null,
      },
    });

    const employers = await prisma.employerProfile.findMany({
      where: { companyId: id },
      select: { userId: true },
    });
    for (const emp of employers) {
      await notificationsService.createNotification({
        userId: emp.userId,
        type: "COMPANY_VERIFICATION_UPDATED",
        title: `Company Verification ${targetStatus}`,
        message: `Your company '${updated.name}' verification status is now ${targetStatus}.`,
        metadata: { companyId: id, status: targetStatus, rejectionReason },
      }).catch(() => {});
    }

    await this.logAudit({ action: `COMPANY_${targetStatus}`, entity: "Company", entityId: id });
    return updated;
  },

  async deleteCompany(id: string) {
    const res = await prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit({ action: "COMPANY_DELETED", entity: "Company", entityId: id });
    return res;
  },

  async bulkDeleteCompanies(ids: string[]) {
    await prisma.company.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
    await this.logAudit({ action: "BULK_COMPANIES_DELETED", entity: "Company", entityId: ids.join(",") });
    return { count: ids.length };
  },

  async getJobs(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          category: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateJobStatus(id: string, status: any) {
    const res = await prisma.job.update({
      where: { id },
      data: { status },
    });
    await this.logAudit({ action: "JOB_STATUS_UPDATED", entity: "Job", entityId: id, metadata: { status } });
    return res;
  },

  async deleteJob(id: string) {
    const res = await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.logAudit({ action: "JOB_DELETED", entity: "Job", entityId: id });
    return res;
  },

  async getApplications(query: { page?: number; limit?: number; status?: string; jobId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status as any;
    if (query.jobId) where.jobId = query.jobId;

    const [items, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: { include: { company: true } },
          candidate: { include: { user: true, skills: { include: { skill: true } } } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateApplicationStatus(applicationId: string, status: any, changedById: string, reason?: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { candidate: { include: { user: true } }, job: true },
    });

    if (!application) throw new Error('Application not found');

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        statusUpdatedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: application.status,
            toStatus: status,
            changedById,
            changedByRole: 'ADMIN',
            reason: reason || 'Updated by Administrator',
            automated: false,
          },
        },
      },
    });

    // Notify candidate
    await prisma.notification.create({
      data: {
        userId: application.candidate.userId,
        type: 'APPLICATION_STATUS_UPDATE',
        title: 'Application Status Updated',
        message: 'Your application for "' + application.job.title + '" has been updated to ' + status + '.',
        metadata: { applicationId, jobId: application.jobId, newStatus: status },
      },
    });

    await this.logAudit({ actorId: changedById, action: `APPLICATION_${status}`, entity: "JobApplication", entityId: applicationId });

    return updated;
  },

  async logAudit(data: { actorId?: string; action: string; entity: string; entityId: string; metadata?: any }) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: data.actorId || "ADMIN",
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          metadata: data.metadata || {},
        },
      });
    } catch {
      // Ignore logging failures
    }
  },

  async getAuditLogs(query: { page?: number; limit?: number; action?: string; entity?: string; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.entity) where.entity = { contains: query.entity, mode: 'insensitive' };
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { entity: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
        { actorId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getSkills(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { candidateSkills: true, jobSkills: true },
          },
        },
      }),
      prisma.skill.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async createSkill(name: string) {
    const trimmed = name.trim();
    const existing = await prisma.skill.findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
    });
    if (existing) return existing;

    const created = await prisma.skill.create({ data: { name: trimmed } });
    await this.logAudit({ action: "SKILL_CREATED", entity: "Skill", entityId: created.id });
    return created;
  },

  async updateSkill(id: string, name: string) {
    const trimmed = name.trim();
    const updated = await prisma.skill.update({
      where: { id },
      data: { name: trimmed },
    });
    await this.logAudit({ action: "SKILL_UPDATED", entity: "Skill", entityId: id });
    return updated;
  },

  async deleteSkill(id: string) {
    const deleted = await prisma.skill.delete({ where: { id } });
    await this.logAudit({ action: "SKILL_DELETED", entity: "Skill", entityId: id });
    return deleted;
  }
};

