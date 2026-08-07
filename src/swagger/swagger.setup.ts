import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { configSwagger } from "@/configs/index.js";

 const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: configSwagger.title,
      version: configSwagger.version,
      description: configSwagger.description,
    },
  },
  apis: ['src/modules/**/*.route.ts'],
});

export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
};