import { z } from 'zod';

export const updateAdminImageSchema = z.object({
  filename: z.string().trim().min(1, 'Filename is required.'),
});

export const updateAdminDetailsSchema = z.object({
  firstname: z
    .string()
    .trim()
    .min(2, 'Firstname must be at least 2 characters.')
    .max(50)
    .optional(),

  lastname: z
    .string()
    .trim()
    .min(2, 'Lastname must be at least 2 characters.')
    .max(50)
    .optional(),
});

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),
});

export const forgotAdminPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address.'),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),

  code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits.'),
});
