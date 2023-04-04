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
import { LoginUserUseCase } from './use-cases/login-user-use-case';
import { AdaptorModule } from '../adaptors/adaptor.module';
import { LogoutUserUseCase } from './use-cases/logout-user-use-case';
import { PasswordRecoveryUserUseCase } from './use-cases/password-recovery.use-case';

const useCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUserUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
];

@Module({
  imports: [
    CqrsModule,
    MailModule,
    UserModule,
    JwtModule.register({}),
    AdaptorModule,
  ],
  controllers: [AuthController],
  providers: [AtStrategy, RtStrategy, ...useCases],
  exports: [],
})
export class AuthModule {}
