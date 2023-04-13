import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../repositories/user.repository';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ProfileRepositoryAdapter } from '../repositories/adapters/profile-repository.adapter';
import { ProfileQueryRepositoryAdapter } from '../repositories/adapters/profile-query-repository.adapter';
import { Profile } from '@prisma/client';
import { ActiveUserData } from '../types';

export class UpdateProfileCommand {
  constructor(
    public user: ActiveUserData,
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
    const { userId, username } = command.user;

    // check that username does not exist
    const checkUserName = await this.userRepository.findUserByUserName(
      command.updateUserProfileDto.username,
    );
    if (checkUserName && checkUserName.username !== username)
      throw new BadRequestException(
        'This username belongs to a different user',
      );

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
