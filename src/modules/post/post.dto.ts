import { z } from "zod";

export const createPostSchema = z.object({
  communityId: z.string().uuid("Invalid community ID"),
  content: z.string().min(1, "Content cannot be empty"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
