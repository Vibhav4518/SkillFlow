import { z } from "zod";

export const createSkillSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Skill name is required")
      .max(100, "Skill name must not exceed 100 characters"),
  }),
});

export const updateSkillSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Skill name is required")
      .max(100, "Skill name must not exceed 100 characters")
      .optional(),
  }),
});