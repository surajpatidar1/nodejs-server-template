import { ZodTypeAny } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
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
  (middleware as any).validationType = 'body';

  return middleware;
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  const middleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.query = result.data as any;
    next();
  };

  (middleware as any).zodSchema = schema;
  (middleware as any).validationType = 'query';

  return middleware;
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  const middleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.params = result.data as any;
    next();
  };

  (middleware as any).zodSchema = schema;
  (middleware as any).validationType = 'params';

  return middleware;
}

export function validateRequest(
  schemas: RequestValidationSchema,
): RequestHandler {
  const middleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
      }
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
      }
      req.query = result.data as any;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
      }
      req.params = result.data as any;
    }

    next();
  };

  (middleware as any).zodSchemas = schemas;

  return middleware;
}
