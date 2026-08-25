import { Router } from 'express';
import { UserType } from '@/types/index.js';
import { authMiddleware, guard } from '@/middleware/index.js';
import {
  updateImage,
  updateAdminDetails,
  changePassword,
  forgotPassword,
} from './admin.controller.js';
import { validateBody } from '@/middleware/index.js';
import {
  changeAdminPasswordSchema,
  forgotAdminPasswordSchema,
  updateAdminDetailsSchema,
  updateAdminImageSchema,
} from './admin.validator.js';

export const adminRouter = Router();

//public routes
adminRouter.patch(
  '/forgot-password',
  validateBody(forgotAdminPasswordSchema),
  forgotPassword,
);

//protected routes
adminRouter.use(authMiddleware, guard(UserType.ADMIN));
adminRouter.post(
  '/update-image',
  validateBody(updateAdminImageSchema),
  updateImage,
);

adminRouter.patch(
  '/details',
  validateBody(updateAdminDetailsSchema),
  updateAdminDetails,
);

adminRouter.patch(
  '/change-password',
  validateBody(changeAdminPasswordSchema),
  changePassword,
);
