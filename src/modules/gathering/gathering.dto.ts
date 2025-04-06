import { z } from "zod";

export const createGatheringSchema = z.object({
  communityId: z.string().uuid("Invalid community ID"),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  location: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  capacity: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessibilityInfo: z.string().optional(),
  virtualMeetingUrl: z.string().url("Invalid meeting URL").optional(),
});

export const updateGatheringSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .optional(),
  location: z.string().optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"]).optional(),
  capacity: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessibilityInfo: z.string().optional(),
  virtualMeetingUrl: z.string().url("Invalid meeting URL").optional(),
  attendeeCount: z.number().int().nonnegative().optional(),
});

export type CreateGatheringDto = z.infer<typeof createGatheringSchema>;
export type UpdateGatheringDto = z.infer<typeof updateGatheringSchema>;
