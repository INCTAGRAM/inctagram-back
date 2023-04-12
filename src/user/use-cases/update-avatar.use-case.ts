import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileQueryRepository } from '../repositories/profile.query-repository';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

export class UpdateProfileCommand {
  constructor(
    public userId: string,
    public updateUserProfileDto: UpdateUserProfileDto,
  ) {}
}
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}
  public async execute(command: UpdateProfileCommand) {
    const { userId } = command;

    const user = await this.userRepository.findUserById(userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException();

    const profile = await this.profileQueryRepository.findByUserId(userId);

    if (!profile) throw new NotFoundException();

    await this.profileRepository.update(userId, command.updateUserProfileDto);
  }
}
