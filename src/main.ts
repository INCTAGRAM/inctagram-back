import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './config/swagger.config';
import { AppModule } from './app.module';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filter';
import cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
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
