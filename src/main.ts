import { AppModule } from '@app/app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentVariables } from '@utils/config/config';

import { sApiKeyBearer, sJwtBearer } from '@utils/header';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );
  app.useGlobalPipes(new ValidationPipe());
  const logger = new Logger('NestBootstrap');

  // Create a Swagger document options
  const options = new DocumentBuilder()
    .setTitle('Generic API')
    .setDescription('A generic API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      sJwtBearer,
    )
    .addApiKey(
      {
        type: 'apiKey',
        scheme: 'apiKey',
        bearerFormat: 'apiKey',
        name: sApiKeyBearer,
        description: 'Enter API key',
        in: 'header',
      },
      sApiKeyBearer,
    )
    .build();

  // Generate the Swagger document

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const document = SwaggerModule.createDocument(app, options);

  // Set up Swagger UI
  SwaggerModule.setup(`docs`, app, document);

  const configService = app.get(ConfigService<EnvironmentVariables>);
  const PORT = configService.get('PORT', { infer: true });

  await app.listen(PORT, '0.0.0.0'); // MUST specify 0.0.0.0 using fastify
  logger.log(`Listening on port ${PORT}`);
}
bootstrap();
