import { z } from 'zod';

export const updateImageSchema = z.object({
  filename: z.string().trim().min(1, 'Filename is required.'),
});

export const updateUserDetailsSchema = z
  .object({
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

    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(30)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers and underscore.',
      )
      .optional(),

    dialCode: z.string().trim().min(1).max(5).optional(),

    mobile: z
      .string()
      .trim()
      .regex(/^[0-9]{7,15}$/, 'Invalid mobile number.')
      .optional(),

    country: z.string().trim().min(2).max(100).optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(100),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address.'),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),

  code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits.'),
});

export const getAllUsersValidator = z.object({
  search: z.string().trim().optional(),

  skip: z.coerce.number().int().min(0).default(0),

  take: z.coerce.number().int().min(1).max(100).default(10),
});
