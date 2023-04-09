import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdaptorModule } from './adaptors/adaptor.module';
import { DeviceSessionsModule } from './deviceSessions/device-sessions.module';
import { config } from './config/configuration';
import { configValidationSchema } from './config/validation-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    AdaptorModule,
    DeviceSessionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
