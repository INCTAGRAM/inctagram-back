import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';

import {
  PaymentCommand,
  PaymentStrategy,
} from '../payment-strategies/abstract.strategy';
import { PAYMENT_STRATEGIES } from '../constants';
import { ValidatePaymentInputCommand } from './validate-payment-input.use-case';

export class StartPaymentCommand {
  public constructor(
    public readonly paymentProvider: PaymentProvider,
    public readonly priceId: string,
    public readonly userId: string,
  ) {}
}

type PaymentStrategiesMap = {
  [key in PaymentProvider]?: PaymentStrategy;
};

@CommandHandler(StartPaymentCommand)
export class StartPaymentCommandHandler
  implements ICommandHandler<StartPaymentCommand>
{
  private paymentStrategiesMap: PaymentStrategiesMap = {};

  public constructor(
    @Inject(PAYMENT_STRATEGIES)
    private readonly paymentStrategies: PaymentStrategy[],
    private readonly commandBus: CommandBus,
  ) {
    this.paymentStrategies.forEach((strategy) => {
      this.paymentStrategiesMap[strategy.provider] = strategy;
    });
  }

  public async execute(command: StartPaymentCommand): Promise<string | null> {
    const { priceId, userId, paymentProvider } = command;

    if (!this.paymentStrategiesMap[paymentProvider]) {
      throw new NotFoundException('Payment provider not found');
    }

    await this.commandBus.execute(
      new ValidatePaymentInputCommand(userId, priceId),
    );

    const result =
      (await this.paymentStrategiesMap[paymentProvider]?.execute(
        new PaymentCommand(userId, priceId),
      )) || null;

    return result;
  }
}
