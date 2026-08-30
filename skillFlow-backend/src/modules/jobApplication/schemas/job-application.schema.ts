import { z } from "zod";

export const createJobApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, "Job ID is required"),
    candidateId: z.string().optional(),
    resume: z.string().nullable().optional(),
    coverLetter: z.string().max(5000, "Cover letter must not exceed 5000 characters").nullable().optional(),
  }),
});

export const updateJobApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().optional(),
    candidateId: z.string().optional(),
    resume: z.string().nullable().optional(),
    coverLetter: z.string().max(5000, "Cover letter must not exceed 5000 characters").nullable().optional(),
    status: z.string().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      ["APPLIED", "IN_PROGRESS", "REJECTED", "SELECTED", "applied", "in_progress", "rejected", "selected", "shortlisted", "pending", "hired", "withdrawn"],
      { errorMap: () => ({ message: "Invalid application status" }) }
    ),
  }),
});

export const applicationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Application ID is required"),
  }),
});

export const queryJobApplicationSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    jobId: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }).optional(),
});

