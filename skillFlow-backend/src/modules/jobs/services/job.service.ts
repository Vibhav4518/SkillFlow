import { JobRepository } from "../repositories/job.repository.js";
import {
  toJobListItem,
  toJobDetail,
} from "../mappers/job.mapper.js";

import {
  JobListItemDTO,
  JobDetailDTO,
  PromoteJobDTO,
} from "../dtos/job.dto.js";

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/app.error.js";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

export class JobService {
  constructor(
    private readonly jobRepository: JobRepository = new JobRepository()
  ) {}

  // ==========================================================
  // GET ALL JOBS (with optional filters)
  // ==========================================================

  async getAllJobs(query?: Record<string, any>): Promise<any> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 9));

    if (this.jobRepository.findAllWithFilters) {
      const result = await this.jobRepository.findAllWithFilters({
        search: query?.search,
        location: query?.location,
        workType: query?.workType,
        jobType: query?.jobType,
        categoryId: query?.categoryId,
        sortBy: query?.sortBy,
        page,
        limit,
      });

      const mappedJobs = (result.jobs || []).map(toJobListItem);
      const totalPages = Math.max(1, Math.ceil((result.total || 0) / limit));

      return {
        items: mappedJobs,
        jobs: mappedJobs,
        total: result.total || 0,
        page,
        limit,
        totalPages,
      };
    }

    const jobs = await this.jobRepository.findAll();
    const mapped = jobs.map(toJobListItem);
    return {
      items: mapped,
      jobs: mapped,
      total: mapped.length,
      page: 1,
      limit: mapped.length,
      totalPages: 1,
    };
  }

  // ==========================================================
  // GET JOB BY ID
  // ==========================================================

  async getJobById(
    jobId: string
  ): Promise<JobDetailDTO> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return toJobDetail(job);
  }

  // ==========================================================
  // CREATE JOB (Employer only)
  // ==========================================================

  async createJob(data: Record<string, any>, userId: string): Promise<any> {
    if (!userId) throw new UnauthorizedError("Authentication required");

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!employerProfile) {
      throw new ForbiddenError("Employer profile required to post jobs. Please create your company profile first.");
    }

    if (!employerProfile.companyId) {
      throw new ForbiddenError("You must be associated with a company to post jobs.");
    }

    const compStatus = String(employerProfile.company?.verificationStatus || "PENDING").toUpperCase();
    const isVerified = employerProfile.isActive !== false && (compStatus === "APPROVED" || compStatus === "VERIFIED" || (employerProfile as any).isVerified === true);
    if (!isVerified) {
      throw new ForbiddenError("Your company profile must be verified by an admin before you can post jobs.");
    }

    if (!data.title?.trim()) {
      throw new BadRequestError("Job title is required");
    }

    return this.jobRepository.create({
      ...data,
      title: data.title,
      companyId: employerProfile.companyId,
      createdByEmployerId: employerProfile.id,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
    });
  }

  // ==========================================================
  // UPDATE JOB (Employer who owns it, or Admin)
  // ==========================================================

  async updateJob(jobId: string, data: Record<string, any>, userId: string, userRole?: string): Promise<any> {
    if (!userId) throw new UnauthorizedError("Authentication required");

    const job = await this.jobRepository.findRawById(jobId);
    if (!job) throw new NotFoundError("Job not found");

    if (userRole?.toUpperCase() !== "ADMIN") {
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employerProfile) throw new ForbiddenError("Employer profile required");
      if (job.createdByEmployerId !== employerProfile.id) {
        throw new ForbiddenError("You can only edit your own jobs");
      }
    }

    const updateData = { ...data };
    if (updateData.applicationDeadline) {
      updateData.applicationDeadline = new Date(updateData.applicationDeadline);
    }

    return this.jobRepository.update(jobId, updateData);
  }

  // ==========================================================
  // DELETE JOB (soft delete)
  // ==========================================================

  async deleteJob(jobId: string, userId: string, userRole?: string): Promise<any> {
    if (!userId) throw new UnauthorizedError("Authentication required");

    const job = await this.jobRepository.findRawById(jobId);
    if (!job) throw new NotFoundError("Job not found");

    if (userRole?.toUpperCase() !== "ADMIN") {
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
      if (!employerProfile) throw new ForbiddenError("Employer profile required");
      if (job.createdByEmployerId !== employerProfile.id) {
        throw new ForbiddenError("You can only delete your own jobs");
      }
    }

    return this.jobRepository.softDelete(jobId);
  }

  // ==========================================================
  // GET EMPLOYER'S OWN JOBS
  // ==========================================================

  async getEmployerJobs(userId: string, query?: Record<string, any>): Promise<any> {
    const employerProfile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employerProfile) return { jobs: [], total: 0, page: 1, limit: 20 };

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 50));

    return this.jobRepository.findAllWithFilters({
      employerProfileId: employerProfile.id,
      status: query?.status,
      page,
      limit,
    });
  }

  // ==========================================================
  // PROMOTE JOB
  // ==========================================================

  async promoteJob(
    jobId: string,
    employerUserId: string,
    dto: PromoteJobDTO
  ) {
    if (!employerUserId) {
      throw new UnauthorizedError("User authentication required");
    }

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: employerUserId },
    });

    if (!employerProfile) {
      throw new ForbiddenError("Employer profile required to promote jobs");
    }

    const job = await this.jobRepository.findRawById(jobId);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.companyId !== employerProfile.companyId) {
      throw new ForbiddenError("You can only promote jobs belonging to your company");
    }

    const startDate = new Date(dto.promotionStartAt);
    const endDate = new Date(dto.promotionEndAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestError("Invalid promotion dates");
    }

    if (endDate <= startDate) {
      throw new BadRequestError("Promotion end date must be after start date");
    }

    const updatedJob = await this.jobRepository.promoteJob(jobId, {
      promotionType: dto.promotionType,
      promotionStartAt: startDate,
      promotionEndAt: endDate,
      promotionPaymentId: dto.promotionPaymentId,
    });

    return updatedJob;
  }
}

