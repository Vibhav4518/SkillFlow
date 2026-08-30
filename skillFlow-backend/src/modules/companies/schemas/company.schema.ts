import { z } from "zod";

export const createCompanySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(150, "Company name must not exceed 150 characters"),

    websiteUrl: z.string().url("Website URL must be a valid URL").or(z.literal("")).optional().nullable(),
    logoUrl: z.string().url("Logo URL must be a valid URL").or(z.literal("")).optional().nullable(),
    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),
    location: z
      .string()
      .max(150, "Location must not exceed 150 characters")
      .optional()
      .nullable(),
    companySize: z
      .string()
      .max(100, "Company size must not exceed 100 characters")
      .optional()
      .nullable(),
    industry: z
      .string()
      .max(150, "Industry must not exceed 150 characters")
      .optional()
      .nullable(),
    verificationDocumentsUrl: z
      .string()
      .optional()
      .nullable(),
  }),
});

export const updateCompanySchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name must not exceed 150 characters")
        .optional(),

      websiteUrl: z.string().url("Website URL must be a valid URL").or(z.literal("")).optional().nullable(),
      logoUrl: z.string().url("Logo URL must be a valid URL").or(z.literal("")).optional().nullable(),
      description: z
        .string()
        .max(2000, "Description must not exceed 2000 characters")
        .optional()
        .nullable(),
      location: z
        .string()
        .max(150, "Location must not exceed 150 characters")
        .optional()
        .nullable(),
      companySize: z
        .string()
        .max(100, "Company size must not exceed 100 characters")
        .optional()
        .nullable(),
      industry: z
        .string()
        .max(150, "Industry must not exceed 150 characters")
        .optional()
        .nullable(),
      verificationDocumentsUrl: z
        .string()
        .optional()
        .nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

export const companyIdParamSchema = z.object({
  params: z.object({
    companyId: z.string().uuid("Company ID must be a valid UUID"),
  }),
});

export const updateCompanyVerificationSchema = z.object({
  params: z.object({
    companyId: z.string().uuid("Company ID must be a valid UUID"),
  }),

  body: z.object({
    verificationStatus: z.enum(["pending", "verified", "rejected"]),
  }),
});
