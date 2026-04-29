import { z } from "zod";

export const createPostSchema = z
  .object({
    courtId: z.string().uuid().optional(),
    courtNameOverride: z.string().min(1).max(100).optional(),
    playDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    playTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be HH:MM"),
    skillLevel: z.enum(["beginner", "intermediate", "advanced", "any"]),
    playersNeeded: z.number().int().min(1).max(3),
    message: z.string().max(500).optional(),
  })
  .refine((v) => Boolean(v.courtId) || Boolean(v.courtNameOverride), {
    message: "Pick a court or enter a venue name",
    path: ["court"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  area: z.string().max(100).optional(),
  contactPreference: z.enum(["in_app", "whatsapp"]).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
