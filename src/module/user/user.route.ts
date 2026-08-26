import { Router } from 'express';
import {
  authMiddleware,
  guard,
  validateBody,
  validateQuery,
} from '@/middleware/index.js';
import { UserType } from '@/types/index.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  getAllUsersValidator,
  updateImageSchema,
  updateUserDetailsSchema,
} from './user.validator.js';
import {
  updateImage,
  updateUserDetails,
  removeUser,
  changePassword,
  forgotPassword,
  getAllUser,
} from './user.controller.js';

export const userRouter = Router();

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
userRouter.get('/', validateQuery(getAllUsersValidator), getAllUser);
