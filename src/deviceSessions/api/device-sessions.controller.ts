import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { GetRtFromCookieDecorator } from '../../common/decorators/jwt/getRtFromCookie.decorator';
import {
  DeleteAllDevicesSessionsButActiveSwaggerDecorator,
  DeleteDeviceSessionSwaggerDecorator,
  GetAllDevicesSwaggerDecorator,
} from '../../common/decorators/swagger/device-sessions.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AllUserDevicesWithActiveSessionsCommand } from '../use-cases/all-user-devices-with-active-sessions.use-case';
import { DeviceViewModel } from '../types';
import { DeleteAllDeviceSessionsButActiveCommand } from '../use-cases/delete-all-device-sessions-but-active.use-case';
import { DeleteDeviceSessionCommand } from '../use-cases/delete-device-session.use-case';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { ActiveUserData } from '../../user/types';

@ApiTags('DeviceSessions')
@Controller('/api/sessions/devices')
export class DeviceSessionsController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get()
  @GetAllDevicesSwaggerDecorator()
  async getAllDevicesForUserId(
    @ActiveUser() user: ActiveUserData,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute<
      AllUserDevicesWithActiveSessionsCommand,
      Promise<DeviceViewModel[] | null>
    >(
      new AllUserDevicesWithActiveSessionsCommand(
        user,
        refreshToken.refreshToken,
      ),
    );
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete()
  @DeleteAllDevicesSessionsButActiveSwaggerDecorator()
  @HttpCode(204)
  async deleteAllDevicesSessionsButActive(
    @ActiveUser() user: ActiveUserData,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute(
      new DeleteAllDeviceSessionsButActiveCommand(
        user,
        refreshToken.refreshToken,
      ),
    );
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Delete(':deviceId')
  @DeleteDeviceSessionSwaggerDecorator()
  @HttpCode(204)
  async deleteDeviceSessionById(
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: ActiveUserData,
    @GetRtFromCookieDecorator() refreshToken: { refreshToken: string },
  ) {
    return this.commandBus.execute(
      new DeleteDeviceSessionCommand(user, refreshToken.refreshToken, deviceId),
    );
  }
}
