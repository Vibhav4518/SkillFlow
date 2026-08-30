import { z } from "zod";

export const createEmployerProfileSchema = z.object({
  body: z.object({
    companyId: z.string().uuid("Company ID must be a valid UUID"),
    designation: z.string().max(100, "Designation must not exceed 100 characters").optional(),
    department: z.string().max(100, "Department must not exceed 100 characters").optional(),
    phone: z.string().max(20, "Phone number must not exceed 20 characters").optional(),
    profilePhotoUrl: z.string().url("Profile photo URL must be a valid URL").optional(),
  }),
});

export const updateEmployerProfileSchema = z.object({
  body: z
    .object({
      designation: z.string().max(100, "Designation must not exceed 100 characters").optional(),
      department: z.string().max(100, "Department must not exceed 100 characters").optional(),
      phone: z.string().max(20, "Phone number must not exceed 20 characters").optional(),
      profilePhotoUrl: z.string().url("Profile photo URL must be a valid URL").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});
