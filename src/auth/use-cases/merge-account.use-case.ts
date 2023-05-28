import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtAdaptor } from 'src/adaptors/jwt/jwt.adaptor';
import { DevicesSessionsService } from '../services/devices.service';
import { UserRepository } from 'src/user/repositories/user.repository';

export class MergeAccountCommand {
  constructor(
    public readonly data: {
      ip: string;
      mergeCode: string;
      userAgent: string;
      deviceId: string | null;
    },
  ) {}
}
@CommandHandler(MergeAccountCommand)
export class RegisterUserUseCase
  implements ICommandHandler<MergeAccountCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly devicesSessionsService: DevicesSessionsService,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  async execute(command: MergeAccountCommand) {
    try {
      const { mergeCode, ip, userAgent } = command.data;

      const oauthAccount = await this.userRepository.findOauthAccountByQuery({
        mergeCode,
      });

      if (!oauthAccount) throw new ForbiddenException();

      if (oauthAccount.mergeCode !== mergeCode)
        throw new UnauthorizedException();

      const { clientId, userId, type } = oauthAccount;

      await this.userRepository.updateOrCreateOauthAccount({
        clientId,
        userId,
        type,
        linked: true,
      });

      const deviceId = command.data.deviceId || randomUUID();

      const user = <User>await this.userRepository.findUserById(userId);

      const { username } = user;

      const tokens = await this.jwtAdaptor.getTokens(
        userId,
        username,
        deviceId,
      );

      const { accessTokenHash, refreshTokenHash } =
        await this.jwtAdaptor.updateTokensHash(tokens);

      await this.devicesSessionsService.manageDeviceSession(deviceId, {
        ip,
        deviceName: userAgent,
        accessTokenHash,
        refreshTokenHash,
        userId,
      });

      return tokens;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }
}
