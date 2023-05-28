import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentProvider, User } from '@prisma/client';

import { Inject } from '@nestjs/common';

import { PAYMENT_SERVICES } from '../constants';
import { UserRepository } from 'src/user/repositories/user.repository';
import { PaymentProviderService } from '../services/payment-provider.service';

export class CreateCustomerIfNotExistsCommand {
  public constructor(
    public readonly userId: string,
    public readonly provider: PaymentProvider,
  ) {}
}

type PaymentServicesMap = {
  [key in PaymentProvider]?: PaymentProviderService;
};

@CommandHandler(CreateCustomerIfNotExistsCommand)
export class CreateCustomerIfNotExistsCommandHandler
  implements ICommandHandler<CreateCustomerIfNotExistsCommand>
{
  public paymentServicesMap: PaymentServicesMap;

  public constructor(
    @Inject(PAYMENT_SERVICES)
    private readonly paymentServices: PaymentProviderService[],
    private readonly usersRepository: UserRepository,
  ) {
    this.paymentServicesMap = Object.fromEntries(
      this.paymentServices.map((service) => [service.provider, service]),
    );
  }

  public async execute(command: CreateCustomerIfNotExistsCommand) {
    const { userId, provider } = command;

    const { email, username } = <User>(
      await this.usersRepository.findUserById(userId)
    );

    return this.paymentServicesMap[provider]?.createCustomerIfNotExists(
      email,
      username,
    );
  }
}
