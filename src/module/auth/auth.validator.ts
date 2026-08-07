import { z } from 'zod';

export const registerValidator = z.object({
  firstname: z
    .string()
    .min(3)
    .max(100),

  lastname: z
    .string()
    .min(3)
    .max(100),

  username: z
    .string()
    .min(3)
    .max(50)
    .optional(),

  email: z
    .email(),

  dialCode: z
    .string()
    .optional(),

  mobile: z
    .string()
    .optional(),

  country: z
    .string()
    .optional(),

  password: z
    .string()
    .min(8),
});

export const loginValidator = z.object({
  email: z.email(),

  password: z
    .string()
    .min(8),
});