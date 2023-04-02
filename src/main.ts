import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './config/swagger.config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { useGlobalPipes } from './common/pipes/global.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  useGlobalPipes(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4000);
}
bootstrap();
