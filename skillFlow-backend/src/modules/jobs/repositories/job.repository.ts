import { prisma } from "../../../infrastructure/database/lib/prisma.js";

export class JobRepository {

  // ==========================================================
  // GET ALL PUBLISHED JOBS
  // ==========================================================

  async findAll() {
    return prisma.job.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
      },

      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            location: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ==========================================================
  // GET JOB BY ID
  // ==========================================================

  async findById(jobId: string) {
    return prisma.job.findFirst({
      where: {
        id: jobId,
        deletedAt: null,
        status: "PUBLISHED",
      },

      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            location: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
          },
        },

        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // ==========================================================
  // GET RAW JOB BY ID (for ownership / internal checks)
  // ==========================================================

  async findRawById(jobId: string) {
    return prisma.job.findFirst({
      where: {
        id: jobId,
        deletedAt: null,
      },
      include: {
        company: true,
        createdByEmployer: true,
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // GET JOBS BY COMPANY ID
  // ==========================================================

  async findByCompanyId(companyId: string, status?: string) {
    const whereClause: any = {
      companyId,
      deletedAt: null,
    };
    if (status) {
      whereClause.status = status;
    }

    return prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            location: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ==========================================================
  // COUNT JOBS BY COMPANY
  // ==========================================================

  async countByCompany(companyId: string, status?: string) {
    const whereClause: any = {
      companyId,
      deletedAt: null,
    };
    if (status) {
      whereClause.status = status as any;
    }
    return prisma.job.count({
      where: whereClause,
    });
  }

  // ==========================================================
  // PROMOTE JOB
  // ==========================================================

  async promoteJob(
    jobId: string,
    data: {
      promotionType: any;
      promotionStartAt: Date;
      promotionEndAt: Date;
      promotionPaymentId?: string;
    }
  ) {
    return prisma.job.update({
      where: { id: jobId },
      data: {
        isPromoted: true,
        promotionType: data.promotionType,
        promotionStartAt: data.promotionStartAt,
        promotionEndAt: data.promotionEndAt,
        promotionPaymentId: data.promotionPaymentId || null,
        updatedAt: new Date(),
      },
    });
  }

  // ==========================================================
  // FIND ALL WITH FILTERS
  // ==========================================================

  async findAllWithFilters(query: {
    search?: string;
    location?: string;
    workType?: string;
    jobType?: string;
    categoryId?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    employerProfileId?: string;
    status?: string;
  }) {
    const {
      search,
      location,
      workType,
      jobType,
      categoryId,
      sortBy,
      page = 1,
      limit = 20,
      employerProfileId,
      status,
    } = query;

    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (employerProfileId) {
      where.createdByEmployerId = employerProfileId;
      delete where.status; // employer sees all their own statuses
      if (status) where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (workType) {
      where.workType = workType.toUpperCase();
    }

    if (jobType) {
      where.jobType = jobType.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const orderBy: any =
      sortBy === "salary"
        ? { salaryMax: "desc" }
        : sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, logoUrl: true, location: true },
          },
          category: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return { jobs, total, page, limit };
  }

  // ==========================================================
  // CREATE JOB
  // ==========================================================

  async create(data: {
    title: string;
    description?: string;
    location?: string;
    workType?: string;
    jobType?: string;
    salaryMin?: number;
    salaryMax?: number;
    isSalaryVisible?: boolean;
    experienceMin?: number;
    experienceMax?: number;
    vacancies?: number;
    applicationDeadline?: Date;
    categoryId?: string;
    companyId: string;
    createdByEmployerId: string;
    status?: string;
    [key: string]: any;
  }) {
    return prisma.job.create({
      data: {
        title: data.title,
        description: data.description || "",
        location: data.location,
        workType: (data.workType as any) || "ONSITE",
        jobType: (data.jobType as any) || "FULL_TIME",
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        isSalaryVisible: data.isSalaryVisible ?? true,
        experienceMin: data.experienceMin,
        experienceMax: data.experienceMax,
        vacancies: data.vacancies ?? 1,
        applicationDeadline: data.applicationDeadline,
        categoryId: data.categoryId,
        companyId: data.companyId,
        createdByEmployerId: data.createdByEmployerId,
        status: (data.status as any) || "DRAFT",
      },
      include: {
        company: { select: { id: true, name: true, logoUrl: true, location: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  // ==========================================================
  // UPDATE JOB
  // ==========================================================

  async update(jobId: string, data: Record<string, any>) {
    const { id: _id, companyId: _c, createdByEmployerId: _e, ...safeData } = data;
    return prisma.job.update({
      where: { id: jobId },
      data: {
        ...safeData,
        updatedAt: new Date(),
      },
      include: {
        company: { select: { id: true, name: true, logoUrl: true, location: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  // ==========================================================
  // SOFT DELETE JOB
  // ==========================================================

  async softDelete(jobId: string) {
    return prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date(), status: "EXPIRED" as any },
    });
  }
}