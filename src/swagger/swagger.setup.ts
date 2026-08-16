import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './swagger.registry.js';
import { configSwagger } from '@/configs/index.js';

export function setupSwagger(app: Express): void {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const spec = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: configSwagger.title,
      version: configSwagger.version,
      description: configSwagger.description,
    },
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}
