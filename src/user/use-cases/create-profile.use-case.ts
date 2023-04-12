import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { ActiveUserData } from '../types';
import { UserRepository } from '../repositories/user.repository';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileQueryRepository } from '../repositories/profile.query-repository';
import { ProfileRepositoryAdapter } from '../repositories/adapters/profile-repository.adapter';
import { Profile, User } from '@prisma/client';
import { ProfileQueryRepositoryAdapter } from '../repositories/adapters/profile-query-repository.adapter';

export class CreateProfileCommand {
  constructor(
    public userId: string,
    public createUserProfileDto: CreateUserProfileDto,
    public user: ActiveUserData,
  ) {}
}
@CommandHandler(CreateProfileCommand)
export class CreateProfileUseCase
  implements ICommandHandler<CreateProfileCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepositoryAdapter<Profile, User>,
    private readonly profileQueryRepository: ProfileQueryRepositoryAdapter<Profile>,
  ) {}
  async execute(command: CreateProfileCommand) {
    // check if user exists
    const user = await this.userRepository.findUserById(command.user.userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException('User was not found');

    if (user.id !== command.userId)
      throw new ForbiddenException('Access denied');

    const profile = await this.profileQueryRepository.findUserProfileById(
      command.userId,
    );
    if (profile) throw new BadRequestException('Profile already created');

    await this.profileRepository.createUserProfile(
      command.createUserProfileDto,
      command.userId,
    );
  }
}
