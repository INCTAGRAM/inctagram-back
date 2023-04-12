import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { ActiveUserData } from '../types';
import { UserRepository } from '../repositories/user.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';

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
    private readonly profileRepository: ProfileRepository,
  ) {}
  async execute(command: CreateProfileCommand) {
    // check if user exists
    const user = await this.userRepository.findUserById(command.user.userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException('User was not found');

    if (user.id !== command.userId)
      throw new ForbiddenException('Access denied');

    await this.profileRepository.createUserProfile(
      command.createUserProfileDto,
    );
  }
}
