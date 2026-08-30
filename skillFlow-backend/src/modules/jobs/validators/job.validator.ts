import { z } from "zod";

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: z.string().min(1, "Job ID is required"),
  }),
});

export const promoteJobSchema = z.object({
  params: z.object({
    jobId: z.string().min(1, "Job ID is required"),
  }).optional(),
  body: z.object({
    promotionType: z.enum(["FEATURED", "URGENT", "HIGHLIGHTED"], {
      errorMap: () => ({ message: "Invalid promotion type. Must be FEATURED, URGENT, or HIGHLIGHTED" }),
    }),
    promotionStartAt: z.string().datetime({ message: "Invalid ISO start date" }),
    promotionEndAt: z.string().datetime({ message: "Invalid ISO end date" }),
    promotionPaymentId: z.string().optional(),
  }).refine((data) => new Date(data.promotionEndAt) > new Date(data.promotionStartAt), {
    message: "promotionEndAt must be after promotionStartAt",
    path: ["promotionEndAt"],
  }),
});
