import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import Joi from 'joi';

import { MailService } from 'src/mail/mail.service';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { AvatarPayload, CreateUserData } from 'src/user/types';
import { DevicesSessionsService } from '../services/devices.service';
import { GithubUsersService } from '../services/github-users.service';
import { UserRepository } from '../../user/repositories/user.repository';

export interface LoginUserWithGithubCommandData {
  code: string;
  deviceId: string | null;
  ip: string;
  userAgent: string;
}

export class LoginUserWithGithubCommand {
  public constructor(public readonly data: LoginUserWithGithubCommandData) {
    const schema = Joi.object({
      code: Joi.string().required(),
    });

    const { error } = schema.validate({ code: this.data.code });

    if (error) {
      throw new BadRequestException({ cause: error });
    }
  }
}

@CommandHandler(LoginUserWithGithubCommand)
export class LoginUserWithGithubUseCase
  implements ICommandHandler<LoginUserWithGithubCommand>
{
  public constructor(
    private readonly devicesSessionsService: DevicesSessionsService,
    private readonly githubUserService: GithubUsersService,
    private readonly userRepository: UserRepository,
    private readonly emailService: MailService,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}

  public async execute(command: LoginUserWithGithubCommand) {
    try {
      const { code, ip, userAgent } = command.data;

      const githubUserData = await this.githubUserService.getGithubUserData(
        code,
      );

      const { email } = githubUserData;

      let user: Pick<
        User,
        'username' | 'id' | 'oauthClientId' | 'email'
      > | null = await this.userRepository.findUserByEmail(email);

      if (!user) {
        const {
          username,
          avatarUrl,
          firstName,
          lastName,
          id: oauthClientId,
        } = githubUserData;

        const isUsernameInUse = await this.userRepository.findUserByUserName(
          username,
        );

        let uniqueUsername = username;

        if (!isUsernameInUse) {
          uniqueUsername = await this.userRepository.createUniqueUsername(
            username,
          );
        }

        let avatarPayload: AvatarPayload | null = null;

        if (avatarUrl) {
          const avatarMetdata =
            await this.githubUserService.getGithubUserAvatarMetadata(avatarUrl);

          avatarPayload = {
            url: avatarUrl,
            previewUrl: avatarUrl,
            ...avatarMetdata,
          };
        }

        const createUserData: CreateUserData = {
          email,
          name: firstName,
          surname: lastName,
          oauthClientId,
          username: uniqueUsername,
          isConfirmed: true,
        };

        if (avatarPayload) {
          createUserData.avatarPayload = avatarPayload;
        }

        user = await this.userRepository.createUser(createUserData, null);
      } else if (!user.oauthClientId) {
        const mergeCode = randomUUID();

        await this.userRepository.updateAccountsMergeInfo(user.id, {
          mergeCode,
          expirationDate: add(new Date(), { minutes: 10 }),
        });

        return this.emailService.sendAccountsMerge(user, code);
      }

      const deviceId = command.data.deviceId || randomUUID();

      const { id: userId, username } = user;

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
      throw new UnauthorizedException();
    }
  }
}
