import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { BadRequestException, GoneException } from '@nestjs/common';
import { UserRepository } from 'src/user/repositories/user.repository';
import { DeviceSessionsRepository } from 'src/deviceSessions/repositories/device-sessions.repository';

export class NewPasswordCommand {
  public constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  public constructor(
    private readonly usersRepository: UserRepository,
    private readonly deviceSessionsRepository: DeviceSessionsRepository,
  ) {}

  public async execute(command: NewPasswordCommand) {
    const { newPassword, recoveryCode } = command;

    try {
      const user =
        await this.usersRepository.findUserByConfirmationOrRecoveryCode(
          recoveryCode,
        );

      if (!user) throw new BadRequestException();

      const exp = user?.passwordRecovery?.expirationDate;

      if (exp) {
        if (new Date(exp) > new Date()) {
          const hash = await bcrypt.hash(newPassword, 10);

          await this.usersRepository.updatePassword(user.id, hash);
          await this.deviceSessionsRepository.deleteAllUserSessions(user.id);
        } else {
          throw new GoneException();
        }
      }
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;
    }
  }
}
