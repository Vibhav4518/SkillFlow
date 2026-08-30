import { z } from "zod";

export const candidateMeQuerySchema = z.object({}).strict();
export type CandidateMeQuery = z.infer<typeof candidateMeQuerySchema>;

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100).optional(),
    headline: z.string().max(255).optional(),
    summary: z.string().max(2000).optional(),
    phone: z.string().max(20).optional(), 
    location: z.string().max(100).optional(),
    preferredWorkType: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
    linkedinUrl: z.string().url().max(255).optional().or(z.literal("")),
    githubUrl: z.string().url().max(255).optional().or(z.literal("")),
    portfolioUrl: z.string().url().max(255).optional().or(z.literal("")),
    profilePhotoUrl: z.string().url().max(500).optional().or(z.literal("")),
    skills: z.array(z.any()).optional(),
  }),
});

export const createEducationSchema = z.object({
  body: z.object({
    degree: z.string().min(1, "Degree is required").max(100),
    institution: z.string().min(1, "Institution is required").max(200),
    fieldOfStudy: z.string().max(100).optional().or(z.literal("")),
    startYear: z.coerce.number().int().min(1950).max(2100).optional(),
    endYear: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
    grade: z.string().max(50).optional(),
    gradeType: z.string().max(50).optional(),
  }),
});

export const updateEducationSchema = z.object({
  body: z.object({
    degree: z.string().min(1).max(100).optional(),
    institution: z.string().min(1).max(200).optional(),
    fieldOfStudy: z.string().max(100).optional(),
    startYear: z.coerce.number().int().min(1950).max(2100).optional(),
    endYear: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
    grade: z.string().max(50).optional(),
    gradeType: z.string().max(50).optional(),
  }),
});

export const createLanguageSchema = z.object({
  body: z.object({
    language: z.string().min(1, "Language name is required").max(100),
    canRead: z.boolean().optional(),
    canWrite: z.boolean().optional(),
    canSpeak: z.boolean().optional(),
  }),
});

export const updateLanguageSchema = z.object({
  body: z.object({
    language: z.string().min(1).max(100).optional(),
    canRead: z.boolean().optional(),
    canWrite: z.boolean().optional(),
    canSpeak: z.boolean().optional(),
  }),
});

export const createExperienceSchema = z.object({
  body: z.object({
    type: z.enum(["INTERNSHIP", "EXPERIENCE"]).optional().default("EXPERIENCE"),
    companyName: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    designation: z.string().max(100).optional(),
    title: z.string().max(100).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().nullable().optional(),
    description: z.string().max(2000).optional(),
    technologies: z.string().max(500).optional(),
  }).transform((data) => ({
    ...data,
    type: data.type || "EXPERIENCE",
    companyName: data.companyName || data.company || "Company",
    designation: data.designation || data.title || "Role",
  })),
});

export const updateExperienceSchema = z.object({
  body: z.object({
    type: z.enum(["INTERNSHIP", "EXPERIENCE"]).optional(),
    companyName: z.string().min(1).max(200).optional(),
    company: z.string().min(1).max(200).optional(),
    designation: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
    description: z.string().max(2000).optional(),
    technologies: z.string().max(500).optional(),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required").max(200),
    description: z.string().max(2000).optional(),
    technologies: z.string().max(500).optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
    githubUrl: z.string().max(255).optional().or(z.literal("")),
    liveUrl: z.string().max(255).optional().or(z.literal("")),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    technologies: z.string().max(500).optional(),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
    githubUrl: z.string().max(255).optional().or(z.literal("")),
    liveUrl: z.string().max(255).optional().or(z.literal("")),
  }),
});

export const createCertificationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Certification name is required").max(200),
    issuingOrganization: z.string().max(200).optional(),
    issueDate: z.string().optional(),
    credentialUrl: z.string().max(255).optional().or(z.literal("")),
  }),
});

export const updateCertificationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    issuingOrganization: z.string().max(200).optional(),
    issueDate: z.string().optional(),
    credentialUrl: z.string().max(255).optional().or(z.literal("")),
  }),
});

export const assignSkillsSchema = z.object({
  body: z.object({
    skillIds: z.array(z.string().min(1)).min(1, "At least one skill ID must be provided"),
  }),
});