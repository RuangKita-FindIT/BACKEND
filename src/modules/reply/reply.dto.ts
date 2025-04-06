import { z } from "zod";

export const createReplySchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  communityId: z.string().uuid("Invalid community ID"),
  content: z.string().min(1, "Content cannot be empty"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updateReplySchema = z.object({
  content: z.string().min(1, "Content cannot be empty").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export type CreateReplyDto = z.infer<typeof createReplySchema>;
export type UpdateReplyDto = z.infer<typeof updateReplySchema>;
