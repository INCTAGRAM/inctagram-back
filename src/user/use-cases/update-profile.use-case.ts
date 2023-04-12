import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveUserData } from '../types';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserProfileDto } from '../dto/update.user.profile.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepositoryAdapter } from '../repositories/adapters/profile-repository.adapter';
import { Profile, User } from '@prisma/client';

export class UpdateProfileCommand {
  constructor(
    public userId: string,
    public updateUserProfileDto: UpdateUserProfileDto,
    public user: ActiveUserData,
  ) {}
}
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepositoryAdapter<Profile, User>,
  ) {}
  async execute(command: UpdateProfileCommand) {
    // check if user exists
    const user = await this.userRepository.findUserById(command.user.userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException('User was not found');

    if (user.id !== command.userId)
      throw new ForbiddenException('Access denied');
    //
    // check that username does not exist
    const checkUserName = await this.userRepository.findUserByUserName(
      command.updateUserProfileDto.username,
    );
    if (checkUserName && checkUserName.username === user.username) return true;
    if (checkUserName && checkUserName.username !== user.username)
      throw new BadRequestException(
        'This username already belongs to a different user.',
      );

    await this.profileRepository.updateUserProfile(
      command.updateUserProfileDto,
      command.userId,
    );
  }
}
