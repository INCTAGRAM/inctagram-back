import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ProfileRepositoryAdapter } from '../repositories/adapters/profile-repository.adapter';
import { ProfileQueryRepositoryAdapter } from '../repositories/adapters/profile-query-repository.adapter';
import { Profile } from '@prisma/client';

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
    private readonly profileRepository: ProfileRepositoryAdapter<Profile>,
    private readonly profileQueryRepository: ProfileQueryRepositoryAdapter,
  ) {}
  public async execute(command: UpdateProfileCommand) {
    const { userId } = command;

    const user = await this.userRepository.findUserById(userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException();

    const profile = await this.profileQueryRepository.findProfileByUserId(
      userId,
    );

    if (!profile) throw new NotFoundException();

    await this.profileRepository.updateProfile(
      userId,
      command.updateUserProfileDto,
    );
  }
}
