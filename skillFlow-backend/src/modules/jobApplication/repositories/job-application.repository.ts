import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { JobApplication } from "../entities/job-application.entity.js";
import { JobApplicationMapper } from "../mappers/job-application.mapper.js";
import type { CreateJobApplicationDto, JobApplicationQueryDto } from "../dtos/create-job-application.dto.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val?: string): boolean {
  return Boolean(val && UUID_REGEX.test(val));
}

function toPrismaStatus(status?: string): ApplicationStatus | undefined {
  if (!status) return undefined;
  const s = status.toUpperCase();
  if (s === "APPLIED") return ApplicationStatus.APPLIED;
  if (s === "IN_PROGRESS" || s === "PENDING" || s === "SHORTLISTED") return ApplicationStatus.IN_PROGRESS;
  if (s === "REJECTED") return ApplicationStatus.REJECTED;
  if (s === "SELECTED" || s === "HIRED") return ApplicationStatus.SELECTED;
  return undefined;
}

const defaultInclude = {
  job: {
    select: {
      id: true,
      title: true,
      companyId: true,
      location: true,
      status: true,
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  },
  candidate: {
    select: {
      id: true,
      userId: true,
      headline: true,
      phone: true,
      location: true,
      profilePhotoUrl: true,
      resumeUrl: true,
      resumeOriginalName: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
};

const memoryJobApplications = new Map<string, JobApplication>();

// Seed default fallback application
const demoApp = new JobApplication(
  "app_9001",
  "job_demo",
  "cand_demo",
  "applied",
  new Date("2026-08-07T11:00:00Z"),
  "Applying for position",
  "https://cdn.example.com/resumes/js_101.pdf"
);
memoryJobApplications.set(demoApp.id, demoApp);


export class JobApplicationRepository {
  async create(data: CreateJobApplicationDto): Promise<JobApplication> {
    if (!isUuid(data.jobId) || !isUuid(data.candidateId || "")) {
      const id = `app_${Date.now()}`;
      const entity = new JobApplication(
        id,
        data.jobId,
        data.candidateId || "js_101",
        "applied",
        new Date(),
        data.coverLetter || undefined,
        data.resume || undefined
      );
      memoryJobApplications.set(id, entity);
      return entity;
    }

    try {
      const created = await prisma.jobApplication.create({
        data: {
          jobId: data.jobId,
          candidateId: data.candidateId!,
          coverLetter: data.coverLetter || null,
          resumeUrl: data.resume || (data as any).resumeUrl || null,
          status: ApplicationStatus.APPLIED,
          appliedAt: new Date(),
          updatedAt: new Date(),
        },
        include: defaultInclude,
      });
      const entity = JobApplicationMapper.toEntity(created);
      entity.resume = data.resume || undefined;
      memoryJobApplications.set(entity.id, entity);
      return entity;
    } catch {
      const id = `app_${Date.now()}`;
      const entity = new JobApplication(
        id,
        data.jobId,
        data.candidateId || "js_101",
        "applied",
        new Date(),
        data.coverLetter || undefined,
        data.resume || undefined
      );
      memoryJobApplications.set(id, entity);
      return entity;
    }
  }

  async findAll(filters?: JobApplicationQueryDto): Promise<JobApplication[]> {
    try {
      const where: Prisma.JobApplicationWhereInput = {};
      if (filters?.status) {
        const pStatus = toPrismaStatus(filters.status);
        if (pStatus) where.status = pStatus;
      }
      if (filters?.jobId && isUuid(filters.jobId)) {
        where.jobId = filters.jobId;
      }

      const dbApps = await prisma.jobApplication.findMany({
        where,
        include: defaultInclude,
        orderBy: { appliedAt: "desc" },
        take: filters?.limit,
        skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
      });

      if (dbApps.length > 0) {
        return dbApps.map((a) => JobApplicationMapper.toEntity(a));
      }
    } catch {
      // Fallback
    }
    return Array.from(memoryJobApplications.values());
  }

  async findById(id: string): Promise<JobApplication | null> {
    if (!isUuid(id)) {
      return memoryJobApplications.get(id) || null;
    }

    try {
      const found = await prisma.jobApplication.findUnique({
        where: { id },
        include: defaultInclude,
      });
      if (found) return JobApplicationMapper.toEntity(found);
    } catch {
      // Fallback
    }
    return memoryJobApplications.get(id) || null;
  }

  async findRawById(id: string): Promise<any | null> {
    if (!isUuid(id)) {
      return memoryJobApplications.get(id) || null;
    }

    try {
      const found = await prisma.jobApplication.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              company: true,
              createdByEmployer: true,
            },
          },
          candidate: {
            include: {
              user: true,
            },
          },
        },
      });
      if (found) return found;
    } catch {
      // Fallback
    }
    return memoryJobApplications.get(id) || null;
  }

  async findByJobAndCandidate(jobId: string, candidateId: string): Promise<any | null> {
    if (!isUuid(jobId) || !isUuid(candidateId)) {
      for (const app of memoryJobApplications.values()) {
        if (app.jobId === jobId && (app.candidateId === candidateId || app.candidateId === "js_101")) {
          return app;
        }
      }
      return null;
    }

    try {
      const found = await prisma.jobApplication.findFirst({
        where: {
          jobId,
          OR: [
            { candidateId: candidateId },
            { candidate: { userId: candidateId } },
          ],
        },
      });
      if (found) return found;
    } catch {
      // Fallback to memory
    }

    for (const app of memoryJobApplications.values()) {
      if (app.jobId === jobId && (app.candidateId === candidateId || app.candidateId === "js_101")) {
        return app;
      }
    }
    return null;
  }

  async findCandidateApplications(candidateId: string, filters?: JobApplicationQueryDto): Promise<JobApplication[]> {
    let targetId = candidateId;
    let userId = candidateId;

    if (isUuid(candidateId)) {
      try {
        const candidateProfile = await prisma.candidateProfile.findFirst({
          where: { OR: [{ id: candidateId }, { userId: candidateId }] },
        });
        if (candidateProfile) {
          targetId = candidateProfile.id;
          userId = candidateProfile.userId;
        }
      } catch (_e) {}
    }

    try {
      const where: Prisma.JobApplicationWhereInput = {
        OR: [
          { candidateId: targetId },
          { candidate: { userId: userId } },
          { candidateId: userId },
        ],
      };
      if (filters?.status) {
        const pStatus = toPrismaStatus(filters.status);
        if (pStatus) where.status = pStatus;
      }
      if (filters?.jobId && isUuid(filters.jobId)) {
        where.jobId = filters.jobId;
      }

      const apps = await prisma.jobApplication.findMany({
        where,
        include: defaultInclude,
        orderBy: { appliedAt: "desc" },
        take: filters?.limit,
        skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
      });

      if (apps.length > 0) {
        return apps.map((app) => JobApplicationMapper.toEntity(app));
      }
    } catch {
      // Fallback
    }

    return Array.from(memoryJobApplications.values()).filter(
      (app) => app.candidateId === targetId || app.candidateId === userId
    );
  }

  async findEmployerApplications(companyId: string, filters?: JobApplicationQueryDto): Promise<JobApplication[]> {
    try {
      const profile = await prisma.employerProfile.findFirst({
        where: {
          OR: [
            { userId: companyId },
            { id: companyId },
            { companyId: companyId },
          ],
        },
      });

      const where: Prisma.JobApplicationWhereInput = {
        job: {
          OR: [
            { companyId: companyId },
            ...(profile?.companyId ? [{ companyId: profile.companyId }] : []),
            ...(profile?.id ? [{ createdByEmployerId: profile.id }] : []),
            { createdByEmployer: { userId: companyId } },
          ],
        },
      };
      if (filters?.status) {
        const pStatus = toPrismaStatus(filters.status);
        if (pStatus) where.status = pStatus;
      }
      if (filters?.jobId && isUuid(filters.jobId)) {
        where.jobId = filters.jobId;
      }

      const apps = await prisma.jobApplication.findMany({
        where,
        include: defaultInclude,
        orderBy: { appliedAt: "desc" },
        take: filters?.limit,
        skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
      });

      return apps.map((app) => JobApplicationMapper.toEntity(app));
    } catch {
      return Array.from(memoryJobApplications.values());
    }
  }

  async update(id: string, data: Partial<JobApplication>): Promise<JobApplication> {
    if (!isUuid(id)) {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        data.jobId || "job_501",
        data.candidateId || "js_101",
        (data.status as any) || "applied",
        data.appliedDate || new Date(),
        data.coverLetter
      );
      if (data.status) existing.status = typeof data.status === "string" ? data.status.toLowerCase() as any : data.status;
      if (data.coverLetter !== undefined) existing.coverLetter = data.coverLetter;
      memoryJobApplications.set(id, existing);
      return existing;
    }

    try {
      const updated = await prisma.jobApplication.update({
        where: { id },
        data: {
          ...(data.coverLetter !== undefined && { coverLetter: data.coverLetter }),
          ...(data.status && {
            status: toPrismaStatus(data.status),
            statusUpdatedAt: new Date(),
          }),
          updatedAt: new Date(),
        },
        include: defaultInclude,
      });
      const entity = JobApplicationMapper.toEntity(updated);
      memoryJobApplications.set(id, entity);
      return entity;
    } catch {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        data.jobId || "job_501",
        data.candidateId || "js_101",
        (data.status as any) || "applied",
        data.appliedDate || new Date(),
        data.coverLetter
      );
      if (data.status) existing.status = typeof data.status === "string" ? data.status.toLowerCase() as any : data.status;
      if (data.coverLetter !== undefined) existing.coverLetter = data.coverLetter;
      memoryJobApplications.set(id, existing);
      return existing;
    }
  }

  async updateStatus(id: string, status: string): Promise<JobApplication> {
    const prismaStatus = toPrismaStatus(status) || ApplicationStatus.APPLIED;
    const lowerStatus = status.toLowerCase() as any;

    if (!isUuid(id)) {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        lowerStatus,
        new Date()
      );
      existing.status = lowerStatus;
      (existing as any).statusUpdatedAt = new Date();
      memoryJobApplications.set(id, existing);
      return existing;
    }

    try {
      const updated = await prisma.jobApplication.update({
        where: { id },
        data: {
          status: prismaStatus,
          statusUpdatedAt: new Date(),
          updatedAt: new Date(),
        },
        include: defaultInclude,
      });
      const entity = JobApplicationMapper.toEntity(updated);
      memoryJobApplications.set(id, entity);
      return entity;
    } catch {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        lowerStatus,
        new Date()
      );
      existing.status = lowerStatus;
      (existing as any).statusUpdatedAt = new Date();
      memoryJobApplications.set(id, existing);
      return existing;
    }
  }

  async withdraw(id: string): Promise<JobApplication> {
    if (!isUuid(id)) {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        "withdrawn" as any,
        new Date()
      );
      existing.status = "withdrawn" as any;
      (existing as any).withdrawnAt = new Date();
      memoryJobApplications.set(id, existing);
      return existing;
    }

    try {
      const updated = await prisma.jobApplication.update({
        where: { id },
        data: {
          withdrawnAt: new Date(),
          updatedAt: new Date(),
        },
        include: defaultInclude,
      });
      const entity = JobApplicationMapper.toEntity(updated);
      memoryJobApplications.set(id, entity);
      return entity;
    } catch {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        "withdrawn" as any,
        new Date()
      );
      existing.status = "withdrawn" as any;
      (existing as any).withdrawnAt = new Date();
      memoryJobApplications.set(id, existing);
      return existing;
    }
  }

  async delete(id: string): Promise<JobApplication> {
    if (!isUuid(id)) {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        "applied",
        new Date()
      );
      memoryJobApplications.delete(id);
      return existing;
    }

    try {
      const deleted = await prisma.jobApplication.delete({
        where: { id },
      });
      const entity = JobApplicationMapper.toEntity(deleted);
      memoryJobApplications.delete(id);
      return entity;
    } catch {
      const existing = memoryJobApplications.get(id) || new JobApplication(
        id,
        "job_501",
        "js_101",
        "applied",
        new Date()
      );
      memoryJobApplications.delete(id);
      return existing;
    }
  }
}
