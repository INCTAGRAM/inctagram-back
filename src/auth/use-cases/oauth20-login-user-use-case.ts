import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionsRepository } from '../../deviceSessions/repositories/device-sessions.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { Oauth20UserData } from '../../user/types';
import { GoogleAuthAdaptor } from '../../adaptors/google/google-auth.adaptor';
import { randomUUID } from 'crypto';

export class Oauth20LoginUserCommand {
  constructor(
    public user: Oauth20UserData,
    public ip: string,
    public userAgent: string,
  ) {}
}
@CommandHandler(Oauth20LoginUserCommand)
export class OauthLoginUserUseCase
  implements ICommandHandler<Oauth20LoginUserCommand>
{
  constructor(
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
    private readonly userRepository: UserRepository,

    private readonly jwtAdaptor: JwtAdaptor,
    private readonly googleAuthAdaptor: GoogleAuthAdaptor,
  ) {}
  async execute(command: Oauth20LoginUserCommand) {
    const { user } = command;

    const validateUser = await this.googleAuthAdaptor.validateUser(user);

    // create tokens and session
    const deviceId = randomUUID();
    // const tokens = await this.jwtAdaptor.getTokens(
    //   validateUser.id,
    //   validateUser.username,
    //   deviceId,
    // );
    // const hashedTokens = await this.jwtAdaptor.updateTokensHash(tokens);
    //
    // // create device session
    // const newDeviceSession =
    //   await this.deviceSessionsRepository.createNewDeviceSession(
    //     deviceId,
    //     validateUser.id,
    //     command.ip,
    //     command.userAgent,
    //     hashedTokens,
    //   );
    //
    // return tokens;
    return {};
  }
}
