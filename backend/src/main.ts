import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: configService.get<string[]>('cors.origins'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Web3 Grants Aggregator API')
    .setDescription(
      'API for aggregating and managing Web3 grant opportunities across multiple blockchains',
    )
    .setVersion('1.0')
    .addTag('grants')
    .addTag('chains')
    .addTag('categories')
    .addTag('subscriptions')
    .addTag('scraper')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-admin-api-key',
        in: 'header',
        description: 'Admin API key for protected endpoints',
      },
      'admin-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port') || 3001;
  await app.listen(port);

  console.log(`
🚀 Web3 Grants Aggregator API is running!
📝 Server: http://localhost:${port}
📚 Swagger docs: http://localhost:${port}/api/docs
🔍 Health check: http://localhost:${port}/api/health
  `);
}

bootstrap();
