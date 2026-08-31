import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/app.error.js";
import { JobApplicationRepository } from "../repositories/job-application.repository.js";
import type {
  CreateJobApplicationDto,
  JobApplicationQueryDto,
} from "../dtos/create-job-application.dto.js";

import { JobApplication } from "../entities/job-application.entity.js";
import { notificationsService } from "../../notifications/notifications.service.js";
import { candidateService } from "../../candidates/services/candidate.service.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val?: string): boolean {
  return Boolean(val && UUID_REGEX.test(val));
}

export class JobApplicationService {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository = new JobApplicationRepository()
  ) {}

  async createJobApplication(
    dto: CreateJobApplicationDto,
    authContext?: { userId: string; role?: string }
  ): Promise<any> {
    let candidateId = dto.candidateId;
    let candidateProfile: any = null;

    if (authContext?.userId) {
      if (authContext.role && authContext.role.toUpperCase() !== "CANDIDATE") {
        throw new ForbiddenError("Only candidates can apply to jobs");
      }

      candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId: authContext.userId },
      });

      if (!candidateProfile && isUuid(authContext.userId)) {
        candidateProfile = await prisma.candidateProfile.findUnique({
          where: { id: authContext.userId },
        });
      }

      if (!candidateProfile) {
        try {
          candidateProfile = await candidateService.getOrCreateCandidateProfile(authContext.userId);
        } catch (_err) {
          if (isUuid(authContext.userId)) {
            try {
              candidateProfile = await prisma.candidateProfile.create({
                data: { userId: authContext.userId },
              });
            } catch (_e) {}
          }
        }
      }

      if (candidateProfile) {
        candidateId = candidateProfile.id;
      } else {
        candidateId = authContext.userId;
      }
    }

    if (!candidateId) {
      throw new BadRequestError("Candidate ID is required");
    }

    if (isUuid(dto.jobId)) {
      const job = await prisma.job.findUnique({
        where: { id: dto.jobId },
      });

      if (!job || job.deletedAt) {
        throw new NotFoundError("Job not found");
      }

      if (job.status !== "PUBLISHED") {
        throw new BadRequestError("Job is not accepting applications");
      }

      if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
        throw new BadRequestError("Job application deadline has passed");
      }
    }

    if (this.jobApplicationRepository.findByJobAndCandidate) {
      const existing = await this.jobApplicationRepository.findByJobAndCandidate(dto.jobId, candidateId);
      if (existing) {
        throw new ConflictError("You have already applied for this job");
      }
    }

    const createdApp = await this.jobApplicationRepository.create({
      jobId: dto.jobId,
      candidateId,
      coverLetter: dto.coverLetter,
      resume: dto.resume || candidateProfile?.resumeUrl || undefined,
    });

    // Notify Employer user of new job application
    try {
      const job = await prisma.job.findUnique({
        where: { id: dto.jobId },
        include: { createdByEmployer: { select: { userId: true } } },
      });
      if (job?.createdByEmployer?.userId) {
        await notificationsService.createNotification({
          userId: job.createdByEmployer.userId,
          type: "NEW_JOB_APPLICATION",
          title: "New Job Application Received",
          message: `A candidate has submitted a new application for '${job.title}'.`,
          metadata: { jobId: job.id, applicationId: (createdApp as any).id },
        });
      }
    } catch (_err) {}

    return createdApp;
  }

  async getAllJobApplications(
    authContext?: { userId: string; role?: string },
    filters?: JobApplicationQueryDto
  ): Promise<any[]> {
    if (!authContext?.role) {
      return this.jobApplicationRepository.findAll(filters);
    }

    const normalizedRole = authContext.role.toUpperCase();

    if (normalizedRole === "CANDIDATE") {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: authContext.userId },
      });
      if (!profile) return [];
      if (this.jobApplicationRepository.findCandidateApplications) {
        return this.jobApplicationRepository.findCandidateApplications(profile.id, filters);
      }
      return this.jobApplicationRepository.findAll(filters);
    }

    if (normalizedRole === "EMPLOYER") {
      const profile = await prisma.employerProfile.findFirst({
        where: { OR: [{ userId: authContext.userId }, { id: authContext.userId }] },
      });
      if (this.jobApplicationRepository.findEmployerApplications) {
        const companyOrUserId = profile?.companyId || profile?.id || authContext.userId;
        return this.jobApplicationRepository.findEmployerApplications(companyOrUserId, filters);
      }
      return this.jobApplicationRepository.findAll(filters);
    }

    if (normalizedRole === "ADMIN") {
      return this.jobApplicationRepository.findAll(filters);
    }

    return this.jobApplicationRepository.findAll(filters);
  }

  async getJobApplicationById(
    id: string,
    authContext?: { userId: string; role?: string }
  ): Promise<any | null> {
    const rawApp = this.jobApplicationRepository.findRawById
      ? await this.jobApplicationRepository.findRawById(id)
      : await this.jobApplicationRepository.findById(id);

    if (!rawApp) {
      return null;
    }

    if (authContext?.role) {
      const normalizedRole = authContext.role.toUpperCase();

      if (normalizedRole === "CANDIDATE") {
        const candidateProfile = await prisma.candidateProfile.findUnique({
          where: { userId: authContext.userId },
        });
        if (candidateProfile && rawApp.candidateId && rawApp.candidateId !== candidateProfile.id) {
          throw new ForbiddenError("Access denied. You can only view your own applications");
        }
      } else if (normalizedRole === "EMPLOYER") {
        const employerProfile = await prisma.employerProfile.findUnique({
          where: { userId: authContext.userId },
        });
        if (employerProfile && rawApp.job?.companyId && rawApp.job.companyId !== employerProfile.companyId) {
          throw new ForbiddenError("Access denied. You can only view applications for your company jobs");
        }
      }
    }

    return this.jobApplicationRepository.findById(id);
  }

  async updateJobApplication(
    id: string,
    data: Partial<JobApplication>,
    authContext?: { userId: string; role?: string }
  ): Promise<any> {
    if (authContext?.role) {
      const rawApp = this.jobApplicationRepository.findRawById
        ? await this.jobApplicationRepository.findRawById(id)
        : await this.jobApplicationRepository.findById(id);

      if (!rawApp) {
        throw new NotFoundError("Job application not found");
      }

      const normalizedRole = authContext.role.toUpperCase();
      if (normalizedRole === "CANDIDATE") {
        const candidateProfile = await prisma.candidateProfile.findUnique({
          where: { userId: authContext.userId },
        });
        if (candidateProfile && rawApp.candidateId && rawApp.candidateId !== candidateProfile.id) {
          throw new ForbiddenError("Access denied. You can only update your own applications");
        }
      }
    }

    return this.jobApplicationRepository.update(id, data);
  }

  async updateApplicationStatus(
    id: string,
    status: string,
    authContext: { userId: string; role?: string }
  ): Promise<any> {
    if (!authContext?.userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const normalizedRole = authContext.role ? authContext.role.toUpperCase() : "";

    const rawApp = this.jobApplicationRepository.findRawById
      ? await this.jobApplicationRepository.findRawById(id)
      : await this.jobApplicationRepository.findById(id);

    if (!rawApp) {
      throw new NotFoundError("Job application not found");
    }

    if (normalizedRole !== "ADMIN") {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: authContext.userId },
      });
      if (!employerProfile) {
        throw new ForbiddenError("Employer profile required to update application status");
      }

      if (rawApp.job?.companyId && rawApp.job.companyId !== employerProfile.companyId) {
        throw new ForbiddenError("Access denied. You can only update applications for your company jobs");
      }
    }

    const validStatuses = ["APPLIED", "SELECTED", "REJECTED", "WITHDRAWN"];
    const normalizedStatus = status.toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      throw new BadRequestError(`Invalid application status: ${status}. Must be one of ${validStatuses.join(", ")}`);
    }

    const updated = await this.jobApplicationRepository.updateStatus(id, normalizedStatus);

    // Notify candidate of status change
    try {
      const app = updated as any;
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { id: app.candidateId },
        select: { userId: true },
      });
      if (candidateProfile?.userId) {
        const statusMessages: Record<string, string> = {
          APPLIED: "Your application has been received.",
          SELECTED: "Congratulations! You have been selected!",
          REJECTED: "Your application was not selected this time.",
          WITHDRAWN: "Your application has been withdrawn.",
        };
        const msg = statusMessages[normalizedStatus] || `Your application status updated to ${normalizedStatus}.`;
        await prisma.notification.create({
          data: {
            userId: candidateProfile.userId,
            type: "APPLICATION_STATUS",
            title: "Application Status Updated",
            message: msg,
            read: false,
          },
        });
      }
    } catch (_notifErr) {
      // Notification failure must not break status update
    }

    return updated;
  }

  async deleteJobApplication(
    id: string,
    authContext?: { userId: string; role?: string }
  ): Promise<any> {
    if (authContext?.role) {
      const rawApp = this.jobApplicationRepository.findRawById
        ? await this.jobApplicationRepository.findRawById(id)
        : await this.jobApplicationRepository.findById(id);

      if (!rawApp) {
        throw new NotFoundError("Job application not found");
      }

      const normalizedRole = authContext.role.toUpperCase();
      if (normalizedRole === "EMPLOYER") {
        const employerProfile = await prisma.employerProfile.findFirst({
          where: { OR: [{ userId: authContext.userId }, { id: authContext.userId }] },
        });
        if (!employerProfile) {
          throw new ForbiddenError("Employer profile required");
        }
        const appJobCompanyId = rawApp.job?.companyId;
        if (appJobCompanyId && appJobCompanyId !== employerProfile.companyId && rawApp.job?.createdByEmployerId !== employerProfile.id) {
          throw new ForbiddenError("Access denied. You can only delete applications for your company jobs");
        }
      }

      if (normalizedRole === "CANDIDATE") {
        const candidateProfile = await prisma.candidateProfile.findUnique({
          where: { userId: authContext.userId },
        });
        if (candidateProfile && rawApp.candidateId && rawApp.candidateId !== candidateProfile.id) {
          throw new ForbiddenError("Access denied. You can only withdraw your own applications");
        }
        if (this.jobApplicationRepository.withdraw) {
          return this.jobApplicationRepository.withdraw(id);
        }
      }
    }

    return this.jobApplicationRepository.delete(id);
  }
}


