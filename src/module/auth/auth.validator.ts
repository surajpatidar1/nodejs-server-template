import { z } from 'zod';

export const sendCodeValidator = z.object({
  email: z.string().trim().email('Invalid email address.'),

  type: z.enum(['register', 'forgot-password']),
});

export const checkUsernameValidator = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(100),
});

export const registerValidator = z.object({
  firstname: z
    .string()
    .trim()
    .min(3, 'Firstname must be at least 3 characters.')
    .max(100),

  lastname: z
    .string()
    .trim()
    .min(3, 'Lastname must be at least 3 characters.')
    .max(100),

  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscore.',
    ),

  email: z.string().trim().email('Invalid email address.'),

  dialCode: z.string().trim().optional(),

  mobile: z.string().trim().optional(),

  country: z.string().trim().optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),

  code: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits.'),
});

export const loginValidator = z.object({
  email: z.string().trim().email('Invalid email address.'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),
});

export const refreshValidator = z.object({});

export const googleAuthValidator = z.object({
  code: z.string().trim().min(1, 'Authorization code is required.'),
});
