import { Router } from 'express';
import {
  sendCode,
  checkUsername,
  register,
  login,
  refresh,
  googleAuthUrl,
  googleCallback,
} from './auth.controller.js';
import {
  authRateLimiter,
  otpRateLimiter,
  validateBody,
  validateQuery,
} from '@/middleware/index.js';
import {
  checkUsernameValidator,
  googleAuthValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  sendCodeValidator,
} from './auth.validator.js';

export const authRouter = Router();

authRouter.post(
  '/send-code',
  otpRateLimiter,
  validateBody(sendCodeValidator),
  sendCode,
);

authRouter.post(
  '/check-username',
  validateBody(checkUsernameValidator),
  checkUsername,
);

authRouter.post('/register', validateBody(registerValidator), register);

authRouter.post('/login', authRateLimiter, validateBody(loginValidator), login);

authRouter.post('/refresh', validateBody(refreshValidator), refresh);

// Google OAuth
authRouter.get('/google', googleAuthUrl);

authRouter.get(
  '/google/callback',
  validateQuery(googleAuthValidator),
  googleCallback,
);

authRouter.post('/google', validateBody(googleAuthValidator), googleCallback);

export default authRouter;
