import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  textSize: z.string().optional(),
  highContrastEnabled: z.boolean().optional(),
  languagePreference: z.string().optional(),
});

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
