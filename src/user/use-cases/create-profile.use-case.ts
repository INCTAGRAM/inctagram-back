import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { UserRepository } from '../repositories/user.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileQueryRepository } from '../repositories/profile.query-repository';

export class CreateProfileCommand {
  constructor(
    public userId: string,
    public createUserProfileDto: CreateUserProfileDto,
  ) {}
}
@CommandHandler(CreateProfileCommand)
export class CreateProfileUseCase
  implements ICommandHandler<CreateProfileCommand>
{
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}
  public async execute(command: CreateProfileCommand) {
    const { userId } = command;

    const user = await this.userRepository.findUserById(userId);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException();

    const profile = await this.profileQueryRepository.findByUserId(userId);

    if (profile) throw new ForbiddenException();

    await this.profileRepository.create(userId, command.createUserProfileDto);
  }
}
