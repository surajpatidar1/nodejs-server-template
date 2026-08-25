import { Router } from 'express';
import {
  sendCode,
  checkUsername,
  register,
  login,
  refresh,
} from './auth.controller.js';
import { validateBody } from '@/middleware/body.validate.middleware.js';
import {
  checkUsernameValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  sendCodeValidator,
} from './auth.validator.js';

const authRouter = Router();

authRouter.post('/send-code', validateBody(sendCodeValidator), sendCode);

authRouter.post(
  '/check-username',
  validateBody(checkUsernameValidator),
  checkUsername,
);

authRouter.post('/register', validateBody(registerValidator), register);

authRouter.post('/login', validateBody(loginValidator), login);

authRouter.post('/refresh', validateBody(refreshValidator), refresh);

export default authRouter;
