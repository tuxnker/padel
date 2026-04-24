import { z } from "zod";

export const createPostSchema = z.object({
  courtId: z.string().uuid().optional(),
  courtNameOverride: z.string().min(1).max(100).optional(),
  playDate: z.string().min(1, "Date is required"),
  playTime: z.string().min(1, "Time is required"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "any"]),
  playersNeeded: z.number().int().min(1).max(3),
  message: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  area: z.string().max(100).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
