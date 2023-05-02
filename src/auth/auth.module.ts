import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AtStrategy, RtStrategy } from './strategies';
import { AuthController } from './api/auth.controller';
import { AdaptorModule } from '../adaptors/adaptor.module';
import { ImageService } from 'src/common/services/image.service';
import { SharpService } from 'src/common/services/sharp.service';
import { LoginUserUseCase } from './use-cases/login-user-use-case';
import { DevicesSessionsService } from './services/devices.service';
import { GithubUsersService } from './services/github-users.service';
import { LogoutUserUseCase } from './use-cases/logout-user-use-case';
import { NewPasswordUseCase } from './use-cases/new-password.use-case';
import { RegisterUserUseCase } from './use-cases/register-user-use-case';
import { DeviceSessionsModule } from '../deviceSessions/device-sessions.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { OauthLoginUserUseCase } from './use-cases/oauth20-login-user-use-case';
import { PasswordRecoveryUserUseCase } from './use-cases/password-recovery.use-case';
import { ConfirmRegistrationUseCase } from './use-cases/confirm-registration-use-case';
import { LoginUserWithGithubUseCase } from './use-cases/login-user-with-github.use-case';
import { RegistrationEmailResendingUseCase } from './use-cases/registration-email-resending-use-case';

const useCases = [
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUserUseCase,
  ConfirmRegistrationUseCase,
  LoginUserWithGithubUseCase,
  RegisterUserUseCase,
  NewPasswordUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  OauthLoginUserUseCase,
];

@Module({
  imports: [
    CqrsModule,
    MailModule,
    UserModule,
    JwtModule.register({}),
    AdaptorModule,
    DeviceSessionsModule,
  ],
  controllers: [AuthController],
  providers: [
    AtStrategy,
    RtStrategy,
    GithubUsersService,
    DevicesSessionsService,
    GoogleStrategy,
    {
      provide: ImageService,
      useClass: SharpService,
    },
    ...useCases,
  ],
  exports: [],
})
export class AuthModule {}
