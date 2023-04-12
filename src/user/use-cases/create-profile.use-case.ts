import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { ActiveUserData } from '../types';

export class CreateProfileCommand {
  constructor(
    userId: string,
    createUserProfileDto: CreateUserProfileDto,
    user: ActiveUserData,
  ) {}
}
@CommandHandler(CreateProfileCommand)
export class CreateProfileUseCase
  implements ICommandHandler<CreateProfileCommand>
{
  constructor() {}
  async execute(command: CreateProfileCommand) {}
}
