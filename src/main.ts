import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { PrismaService } from './prisma/prisma.service';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors({
    origin: [
      'http://0.0.0.0:3000',
      process.env.FRONTEND_LOCAL_DOMAIN as string,
      process.env.FRONTEND_DOMAIN as string,
    ],
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
      'Authorization',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
  });
  app.use(cookieParser());
  app.use(compression());

  setupSwagger(app);
  useGlobalPipes(app);
  useGlobalFilters(app);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
