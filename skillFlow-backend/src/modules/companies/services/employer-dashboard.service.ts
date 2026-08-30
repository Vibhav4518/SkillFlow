import { prisma } from "../../../infrastructure/database/lib/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../../../errors/app.error.js";

import { EmployerProfileRepository, type IEmployerProfileRepository } from "../repositories/employer-profile.repository.js";
import { JobRepository } from "../../jobs/repositories/job.repository.js";
import { JobApplicationRepository } from "../../jobApplication/repositories/job-application.repository.js";
import type {
  EmployerDashboardStatsDTO,
  EmployerJobsQueryDTO,
  EmployerApplicationsQueryDTO,
  EmployerCandidatesQueryDTO,
} from "../dtos/employer-dashboard.dto.js";

export class EmployerDashboardService {
  constructor(
    private readonly employerProfileRepository: IEmployerProfileRepository = new EmployerProfileRepository(),
    private readonly jobRepository: JobRepository = new JobRepository(),
    private readonly jobApplicationRepository: JobApplicationRepository = new JobApplicationRepository(),
  ) {}

  private async getEmployerCompanyId(employerUserId: string): Promise<string> {
    if (!employerUserId) {
      throw new UnauthorizedError("User authentication required");
    }

    const profile = await this.employerProfileRepository.findByUserId(employerUserId);
    if (!profile) {
      throw new ForbiddenError("Employer profile required to access employer dashboard");
    }

    return profile.companyId;
  }

  async getDashboardStats(employerUserId: string): Promise<EmployerDashboardStatsDTO> {
    const companyId = await this.getEmployerCompanyId(employerUserId);

    const profile = await prisma.employerProfile.findFirst({
      where: {
        OR: [
          { userId: employerUserId },
          { id: employerUserId },
        ],
      },
      include: { company: true },
    });

    const jobWhere: any = {
      deletedAt: null,
      OR: [
        ...(profile?.companyId ? [{ companyId: profile.companyId }] : []),
        ...(profile?.id ? [{ createdByEmployerId: profile.id }] : []),
        { createdByEmployer: { userId: employerUserId } },
      ],
    };

    try {
      const [
        totalJobs,
        activeJobs,
        draftJobs,
        closedJobs,
        totalApplications,
        appliedApplications,
        inProgressApplications,
        shortlistedApplications,
        interviewApplications,
        selectedApplications,
        rejectedApplications,
        withdrawnApplications,
      ] = await Promise.all([
        prisma.job.count({
          where: jobWhere,
        }),
        prisma.job.count({
          where: { ...jobWhere, status: "PUBLISHED" },
        }),
        prisma.job.count({
          where: { ...jobWhere, status: "DRAFT" },
        }),
        prisma.job.count({
          where: { ...jobWhere, status: "CLOSED" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "APPLIED" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "IN_PROGRESS" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "SHORTLISTED" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "INTERVIEW" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "SELECTED" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "REJECTED" },
        }),
        prisma.jobApplication.count({
          where: { job: jobWhere, status: "WITHDRAWN" },
        }),
      ]);

      return {
        activeJobs,
        publishedJobs: activeJobs,
        draftJobs,
        closedJobs,
        totalJobs,
        totalApplications,
        appliedApplications,
        inProgressApplications,
        shortlistedApplications,
        interviewApplications,
        selectedApplications,
        rejectedApplications,
        withdrawnApplications,
      };
    } catch {
      return {
        activeJobs: 0,
        publishedJobs: 0,
        draftJobs: 0,
        closedJobs: 0,
        totalJobs: 0,
        totalApplications: 0,
        appliedApplications: 0,
        inProgressApplications: 0,
        shortlistedApplications: 0,
        interviewApplications: 0,
        selectedApplications: 0,
        rejectedApplications: 0,
        withdrawnApplications: 0,
      };
    }
  }

  async getEmployerJobs(employerUserId: string, query?: EmployerJobsQueryDTO) {
    const companyId = await this.getEmployerCompanyId(employerUserId);
    const jobs = await this.jobRepository.findByCompanyId(companyId, query?.status);

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      workType: job.workType,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      status: job.status,
      vacancies: job.vacancies,
      applicationDeadline: job.applicationDeadline,
      publishedAt: job.publishedAt,
      isPromoted: job.isPromoted,
      promotionType: job.promotionType,
      applicationCount: (job as any)._count?.applications || 0,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      company: job.company,
      category: job.category,
    }));
  }

  async getEmployerApplications(employerUserId: string, query?: EmployerApplicationsQueryDTO) {
    const companyId = await this.getEmployerCompanyId(employerUserId);
    return this.jobApplicationRepository.findEmployerApplications(companyId, query);
  }

  async searchCandidates(employerUserId: string, query?: EmployerCandidatesQueryDTO) {
    await this.getEmployerCompanyId(employerUserId);

    const where: any = {};

    if (query?.location) {
      where.location = {
        contains: query.location,
        mode: "insensitive",
      };
    }

    if (query?.experience !== undefined) {
      where.experienceYears = {
        gte: query.experience,
      };
    }

    if (query?.skill) {
      where.skills = {
        some: {
          skill: {
            name: {
              contains: query.skill,
              mode: "insensitive",
            },
          },
        },
      };
    }

    try {
      const candidates = await prisma.candidateProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          experiences: true,
          education: true,
        },
        take: query?.limit,
        skip: query?.page && query?.limit ? (query.page - 1) * query.limit : undefined,
        orderBy: { createdAt: "desc" },
      });

      return candidates.map((c) => ({
        id: c.id,
        userId: c.userId,
        headline: c.headline,
        summary: c.summary,
        phone: c.phone,
        location: c.location,
        profilePhotoUrl: c.profilePhotoUrl,
        experienceYears: c.experienceYears,
        preferredWorkType: c.preferredWorkType,
        resumeUrl: c.resumeUrl,
        linkedinUrl: c.linkedinUrl,
        githubUrl: c.githubUrl,
        portfolioUrl: c.portfolioUrl,
        user: c.user,
        skills: c.skills.map((s) => s.skill.name),
        experiences: c.experiences,
        education: c.education,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
    } catch {
      return [];
    }
  }
}
