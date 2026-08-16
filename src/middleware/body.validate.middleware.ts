import { ZodObject } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function validateBody(schema: ZodObject): RequestHandler {
  const middleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };

  (middleware as any).zodSchema = schema;

  return middleware;
}
