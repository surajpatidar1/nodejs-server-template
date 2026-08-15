import { Router } from 'express';
import {
  updateImage,
  updateAdminDetails,
  changePassword,
  forgotPassword,
} from './admin.controller.js';
import { guard } from '@/middleware/guard.middleware.js';
import { validateBody } from '@/middleware/body.validate.middleware.js';
import { UserType } from '@/types/index.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import {
  changeAdminPasswordSchema,
  forgotAdminPasswordSchema,
  updateAdminDetailsSchema,
} from './admin.validator.js';

const adminRouter = Router();

adminRouter.use(guard(UserType.ADMIN), authMiddleware);

adminRouter.post('/update-image', updateImage);

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

adminRouter.patch(
  '/forgot-password',
  validateBody(forgotAdminPasswordSchema),
  forgotPassword,
);

export default adminRouter;
