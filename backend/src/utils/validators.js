import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().max(500).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().max(255).optional().or(z.literal("")),
  twitter: z.string().max(255).optional(),
  emailNotifications: z.boolean().optional(),
  // Allow reasonably sized base64 avatar images (~1–1.5MB after encoding)
  avatarUrl: z.string().max(2_000_000).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});
