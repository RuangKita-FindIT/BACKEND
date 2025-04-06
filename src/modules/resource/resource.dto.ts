import { z } from "zod";

export const createResourceSchema = z.object({
  communityId: z.string().uuid("Invalid community ID"),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  fileUrl: z.string().url("Invalid file URL"),
});

export const updateResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .optional(),
  fileUrl: z.string().url("Invalid file URL").optional(),
});

export type CreateResourceDto = z.infer<typeof createResourceSchema>;
export type UpdateResourceDto = z.infer<typeof updateResourceSchema>;
