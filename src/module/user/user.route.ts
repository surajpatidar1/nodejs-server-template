import { Router } from 'express';
import {
  updateImage,
  updateUserDetails,
  removeUser,
  changePassword,
  forgotPassword,
} from './user.controller.js';

import { authMiddleware } from '@/middleware/auth.middleware.js';
import { guard } from '@/middleware/guard.middleware.js';
import { validateBody } from '@/middleware/body.validate.middleware.js';
import { UserType } from '@/types/index.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  updateImageSchema,
  updateUserDetailsSchema,
} from './user.validator.js';

const userRouter = Router();

//public route
userRouter.patch(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  forgotPassword,
);

//protected route
userRouter.use(authMiddleware, guard(UserType.USER));
userRouter.post('/update-image', validateBody(updateImageSchema), updateImage);
userRouter.patch(
  '/details',
  validateBody(updateUserDetailsSchema),
  updateUserDetails,
);
userRouter.patch(
  '/change-password',
  validateBody(changePasswordSchema),
  changePassword,
);
userRouter.delete('/:userId', removeUser);

export default userRouter;
