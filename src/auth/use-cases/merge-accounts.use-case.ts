import { UnauthorizedException } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';

export class MergeAccountsCommand {
  public constructor(public readonly code: string) {}
}

export class MergeAccountsUseCase
  implements ICommandHandler<MergeAccountsCommand>
{
  public async execute(command: MergeAccountsCommand): Promise<void> {
    const { code } = command;

    try {
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException();
    }
  }
}
