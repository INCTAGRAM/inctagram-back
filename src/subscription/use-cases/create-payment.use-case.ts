import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';

import {
  PaymentCommand,
  PaymentStrategy,
} from '../payment-strategies/abstract.strategy';
import { PaymentSystem, PAYMENT_STRATEGIES } from '../constants';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';

export class CreatePaymentCommand {
  public constructor(
    public readonly paymentSystem: PaymentSystem,
    public readonly priceId: string,
    public readonly userId: string,
    public readonly renew: boolean,
  ) {}
}

type PaymentServices = {
  [key in PaymentSystem]?: PaymentStrategy;
};

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand>
{
  private paymentServices: PaymentServices = {};

  public constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly paymentStrategies: PaymentStrategy[],
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {
    this.paymentStrategies.forEach((strategy) => {
      this.paymentServices[strategy.name] = strategy;
    });
  }

  public async execute(command: CreatePaymentCommand): Promise<string | null> {
    const { priceId, userId, paymentSystem, renew } = command;

    const price =
      await this.subscriptionsQueryRepository.getSubscriptionPriceById(priceId);

    if (!price)
      throw new NotFoundException({
        cause: 'Price for subscription was not found',
      });

    const result =
      (await this.paymentServices[paymentSystem]?.execute(
        new PaymentCommand(userId, price.id, renew),
      )) || null;

    return result;
  }
}
