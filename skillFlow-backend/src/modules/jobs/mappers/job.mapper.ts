import { JobListItemDTO, JobDetailDTO } from "../dtos/job.dto.js";

// ============================================================
// FORMAT RELATIVE TIME
// ============================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString();
}

// ============================================================
// FORMAT JOB TYPE
// ============================================================

function formatJobType(jobType: string): string {
  const types: Record<string, string> = {
    FULL_TIME: "Full time",
    PART_TIME: "Part time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    TEMPORARY: "Temporary",
  };

  return types[jobType] ?? jobType;
}

// ============================================================
// FORMAT SALARY
// ============================================================

function formatSalary(
  salaryMin: number | null,
  salaryMax: number | null,
): string | null {
  if (salaryMin === null && salaryMax === null) {
    return null;
  }

  if (salaryMin !== null && salaryMax !== null) {
    return `$${salaryMin}-$${salaryMax}`;
  }

  if (salaryMin !== null) {
    return `From $${salaryMin}`;
  }

  return `Up to $${salaryMax}`;
}

// ============================================================
// JOB LIST MAPPER
// ============================================================

export function toJobListItem(job: any): JobListItemDTO {
  return {
    id: job.id,

    slug: job.slug,

    time: formatRelativeTime(job.createdAt),

    title: job.title,

    company: job.company?.name ?? "",

    category: job.category?.name ?? "",

    type: formatJobType(job.jobType),

    salary: formatSalary(job.salaryMin, job.salaryMax) ?? "Not specified",

    location: job.location,

    image: job.company?.logoUrl ?? null,
  };
}

// ============================================================
// JOB DETAIL MAPPER
// ============================================================

export function toJobDetail(job: any): any {
  return {
    ...job,
    id: job.id,
    slug: job.slug,
    title: job.title,
    companyId: job.companyId || job.company?.id,
    company: job.company
      ? {
          id: job.company.id,
          name: job.company.name,
          logoUrl: job.company.logoUrl ?? null,
          location: job.company.location ?? null,
          verificationStatus: job.company.verificationStatus ?? null,
        }
      : { id: job.companyId || "", name: "Company", logoUrl: null, location: null, verificationStatus: null },
    category: job.category
      ? {
          id: job.category.id,
          name: job.category.name,
        }
      : null,
    workType: job.workType ?? "FULL_TIME",
    jobType: job.jobType ?? "FULL_TIME",
    type: formatJobType(job.jobType),
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    experienceMin: job.experienceMin,
    experienceMax: job.experienceMax,
    vacancies: job.vacancies ?? 1,
    status: job.status,
    description: job.description,
    requirements: job.requirements ?? [],
    responsibilities: job.responsibilities ?? [],
    skills: job.skills?.map((jobSkill: any) => typeof jobSkill === "string" ? jobSkill : jobSkill.skill?.name || jobSkill.name).filter(Boolean) ?? [],
    createdAt: job.createdAt ? job.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: job.updatedAt ? job.updatedAt.toISOString() : new Date().toISOString(),
  };
}
