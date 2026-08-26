import type { Express, Router } from 'express';
import { registry } from './swagger.registry.js';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

export function registerModule(
  app: Express,
  basePath: string,
  router: Router,
  tag: string,
) {
  app.use(basePath, router);

  const stack = (router as any).stack as any[];
  const authMiddlewareIndex = stack.findIndex(
    (layer) => !layer.route && layer.name === 'authMiddleware',
  );

  for (const layer of stack) {
    if (!layer.route) continue;

    const layerIndex = stack.indexOf(layer);
    const isProtected =
      authMiddlewareIndex !== -1 && layerIndex > authMiddlewareIndex;

    const routePath: string = layer.route.path;
    const methods = Object.keys(layer.route.methods).filter((m) =>
      HTTP_METHODS.includes(m as any),
    );

    const fullPath = `${basePath}${routePath === '/' ? '' : routePath}`.replace(
      /:([^/]+)/g,
      '{$1}',
    );

    const bodyHandler = layer.route.stack.find(
      (l: any) =>
        l.handle?.validationType === 'body' ||
        (l.handle?.zodSchema && !l.handle?.validationType),
    );
    const queryHandler = layer.route.stack.find(
      (l: any) => l.handle?.validationType === 'query',
    );
    const paramsHandler = layer.route.stack.find(
      (l: any) => l.handle?.validationType === 'params',
    );
    const requestHandler = layer.route.stack.find(
      (l: any) => l.handle?.zodSchemas,
    );

    const bodySchema =
      bodyHandler?.handle?.zodSchema ||
      requestHandler?.handle?.zodSchemas?.body;
    const querySchema =
      queryHandler?.handle?.zodSchema ||
      requestHandler?.handle?.zodSchemas?.query;
    const paramsSchema =
      paramsHandler?.handle?.zodSchema ||
      requestHandler?.handle?.zodSchemas?.params;

    const requestConfig =
      bodySchema || querySchema || paramsSchema
        ? {
            ...(bodySchema && {
              body: {
                content: { 'application/json': { schema: bodySchema } },
              },
            }),
            ...(querySchema && { query: querySchema }),
            ...(paramsSchema && { params: paramsSchema }),
          }
        : undefined;

    for (const method of methods) {
      registry.registerPath({
        method: method as any,
        path: fullPath,
        tags: [tag],
        summary: humanize(routePath),
        security: isProtected ? [{ bearerAuth: [] }] : [],
        request: requestConfig,
        responses: {
          200: { description: 'Success' },
          400: { description: 'Validation error' },
        },
      });
    }
  }
}

function humanize(path: string) {
  const clean = path.replace(/^\//, '').replace(/[-/]/g, ' ').trim();
  return clean ? clean.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Root';
}
