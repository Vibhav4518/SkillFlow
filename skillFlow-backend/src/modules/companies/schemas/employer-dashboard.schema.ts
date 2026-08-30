import { z } from "zod";

export const employerJobsQuerySchema = z.object({
  query: z
    .object({
      status: z.string().optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
    })
    .optional(),
});

export const employerApplicationsQuerySchema = z.object({
  query: z
    .object({
      jobId: z.string().optional(),
      status: z.string().optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
    })
    .optional(),
});

export const employerCandidatesQuerySchema = z.object({
  query: z
    .object({
      skill: z.string().optional(),
      location: z.string().optional(),
      experience: z.coerce.number().min(0).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),
    })
    .optional(),
});
