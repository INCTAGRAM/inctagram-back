import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AdaptorModule } from './adaptors/adaptor.module';
import { configValidationSchema } from './config/validation-schema';
import { TestingModule } from './testing-remove-all-data/testing.module';
import { DeviceSessionsModule } from './deviceSessions/device-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    AdaptorModule,
    DeviceSessionsModule,
    TestingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
