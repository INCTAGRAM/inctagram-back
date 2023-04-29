import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Res,
  UseGuards,
  Headers,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmationCodeDto } from '../dto/confirmation-code.dto';
import { EmailDto } from '../dto/email.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import {
  AuthLoginSwaggerDecorator,
  AuthLogoutSwaggerDecorator,
  AuthNewPasswordSwaggerDecorator,
  AuthPasswordRecoverySwaggerDecorator,
  AuthRefreshTokenSwaggerDecorator,
  AuthRegistrationConfirmationSwaggerDecorator,
  AuthRegistrationEmailResendingSwaggerDecorator,
  AuthRegistrationSwaggerDecorator,
} from '../../common/decorators/swagger/auth.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';
import { ConfirmRegistrationCommand } from '../use-cases/confirm-registration-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { LoginUserCommand } from '../use-cases/login-user-use-case';
import { LoginDto } from '../dto/login.dto';
import { CookieOptions, Request, Response } from 'express';
import { LogginSuccessViewModel } from '../../types';
import { LogoutUserCommand } from '../use-cases/logout-user-use-case';

import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { PasswordRecoveryCommand } from '../use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../use-cases/new-password.use-case';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ActiveUserData } from '../../user/types';
import { JwtRtGuard } from '../../common/guards/jwt-auth.guard';
import { RecaptchaGuard } from 'src/common/guards/recaptcha.guard';
import { CookieAuthGuard } from '../../common/guards/cookie-auth.guard';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  private cookieOptions: Partial<CookieOptions> = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    domain: 'localhost',
  };

  constructor(
    private commandBus: CommandBus,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  @Post('registration')
  @AuthRegistrationSwaggerDecorator()
  @HttpCode(204)
  async registration(@Body() authDto: AuthDto) {
    return this.commandBus.execute(new RegisterUserCommand(authDto));
  }

  @Post('registration-confirmation')
  @AuthRegistrationConfirmationSwaggerDecorator()
  @HttpCode(204)
  async registrationConfirmation(
    @Body() confirmationCodeDto: ConfirmationCodeDto,
  ) {
    return this.commandBus.execute(
      new ConfirmRegistrationCommand(confirmationCodeDto),
    );
  }

  @Post('registration-email-resending')
  @AuthRegistrationEmailResendingSwaggerDecorator()
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailDto) {
    return this.commandBus.execute(
      new RegistrationEmailResendingCommand(emailDto),
    );
  }

  @Post('login')
  @AuthLoginSwaggerDecorator()
  @UseGuards(CookieAuthGuard)
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
    @ActiveUser('deviceId') deviceId: string | null,
  ) {
    if (!userAgent) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(loginDto, ip, userAgent, deviceId));
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @UseGuards(JwtRtGuard)
  @Post('logout')
  @AuthLogoutSwaggerDecorator()
  @HttpCode(204)
  async logout(
    @ActiveUser('deviceId') deviceId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new LogoutUserCommand(deviceId));
    res.clearCookie('refreshToken');
  }

  @UseGuards(JwtRtGuard)
  @Post('refresh-token')
  @AuthRefreshTokenSwaggerDecorator()
  @HttpCode(200)
  async refreshToken(
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.jwtAdaptor.refreshToken(
      user,
    );
    res.cookie('refreshToken', refreshToken, this.cookieOptions);
    return { accessToken };
  }

  @Post('password-recovery')
  @AuthPasswordRecoverySwaggerDecorator()
  @UseGuards(RecaptchaGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() emailDto: EmailDto) {
    const { email } = emailDto;

    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Post('new-password')
  @AuthNewPasswordSwaggerDecorator()
  @HttpCode(204)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    const { newPassword, recoveryCode } = newPasswordDto;

    return this.commandBus.execute(
      new NewPasswordCommand(newPassword, recoveryCode),
    );
  }
}
