import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RegisterUserUseCase } from './use-cases/register-user-use-case';
import { ConfirmRegistrationUseCase } from './use-cases/confirm-registration-use-case';
import { RegistrationEmailResendingUseCase } from './use-cases/registration-email-resending-use-case';
import { AtStrategy, RtStrategy } from './strategies';

const useCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
];
@Module({
  imports: [CqrsModule, MailModule, UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AtStrategy, RtStrategy, ...useCases],
  exports: [],
})
export class AuthModule {}
