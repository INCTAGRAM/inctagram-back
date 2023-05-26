import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';

import {
  PaymentCommand,
  PaymentStrategy,
} from '../payment-strategies/abstract.strategy';
import { PAYMENT_STRATEGIES } from '../constants';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';

export class CreatePaymentCommand {
  public constructor(
    public readonly paymentProvider: PaymentProvider,
    public readonly priceId: string,
    public readonly userId: string,
  ) {}
}

type PaymentServices = {
  [key in PaymentProvider]?: PaymentStrategy;
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
    const { priceId, userId, paymentProvider } = command;

    const price =
      await this.subscriptionsQueryRepository.getSubscriptionPriceById(priceId);

    if (!price)
      throw new NotFoundException('Price for subscription was not found');

    if (!this.paymentServices[paymentProvider]) {
      throw new NotFoundException('Payment provider not found');
    }

    const result =
      (await this.paymentServices[paymentProvider]?.execute(
        new PaymentCommand(userId, price.id),
      )) || null;

    return result;
  }
}
