import type { Request, Response, NextFunction } from 'express';
import { ForbiddenException, UnauthorizedException } from '@/utils/index.js';

export const guard = (...allowedTypes: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) throw UnauthorizedException();
    if (!allowedTypes.includes(user.type)) throw ForbiddenException();
    next();
  };
};
