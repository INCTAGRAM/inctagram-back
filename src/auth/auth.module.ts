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

const useCases = [
  RegisterUserUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LoginUserUseCase,
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
