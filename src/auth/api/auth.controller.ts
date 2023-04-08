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
} from '../../common/decorators/swagger/auth.decorators';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../use-cases/register-user-use-case';
import { ConfirmRegistrationCommand } from '../use-cases/confirm-registration-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { LoginUserCommand } from '../use-cases/login-user-use-case';
import { LoginDto } from '../dto/login.dto';
import { Response } from 'express';
import { LogginSuccessViewModel } from '../../types';
import { LogoutUserCommand } from '../use-cases/logout-user-use-case';
import { AuthGuard } from '@nestjs/passport';
import { RtPayload } from '../strategies/types';
import { GetRtPayloadDecorator } from '../../common/decorators/jwt/getRtPayload.decorator';
import { GetRtFromCookieDecorator } from '../../common/decorators/jwt/getRtFromCookie.decorator';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { PasswordRecoveryCommand } from '../use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../use-cases/new-password.use-case';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
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
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
  ): Promise<LogginSuccessViewModel> {
    if (!userAgent) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(loginDto, ip, userAgent));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  @AuthLogoutSwaggerDecorator()
  @HttpCode(204)
  async logout(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.commandBus.execute(
      new LogoutUserCommand(rtPayload.deviceId, refreshToken),
    );
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  @AuthRefreshTokenSwaggerDecorator()
  @HttpCode(200)
  async refreshToken(
    @GetRtPayloadDecorator() rtPayload: RtPayload,
    @GetRtFromCookieDecorator() rt: { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    console.log(rtPayload);
    const { accessToken, refreshToken } = await this.jwtAdaptor.refreshToken(
      rtPayload,
      rt,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  @Post('password-recovery')
  @AuthPasswordRecoverySwaggerDecorator()
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
