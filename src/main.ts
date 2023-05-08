import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { PrismaService } from './prisma/prisma.service';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
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
