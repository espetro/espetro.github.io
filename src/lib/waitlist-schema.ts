import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;