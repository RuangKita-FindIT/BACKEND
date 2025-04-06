import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z.string().min(3, "Community name must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  categoryId: z.string().uuid("Invalid category ID"),
  location: z.string().optional(),
  sdgTags: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  language: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export const updateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters long")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  location: z.string().optional(),
  sdgTags: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  language: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateCommunityDto = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityDto = z.infer<typeof updateCommunitySchema>;
