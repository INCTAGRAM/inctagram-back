import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CqrsModule, MailModule, UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [],
  exports: [],
})
export class AuthModule {}
