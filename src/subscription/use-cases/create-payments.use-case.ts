import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentStatus,
  SubscriptionPrice,
  SubscriptionType,
} from '@prisma/client';

import { PrismaTransactionType } from 'src/common/types';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { SubscriptionsTransactionService } from '../services/subscriptions-transaction.service';

export class CreatePaymentsCommand {
  public constructor(
    public readonly data: {
      priceId: string;
      userId: string;
      provider: PaymentProvider;
      tx: PrismaTransactionType;
      subscriptionType: SubscriptionType;
    },
  ) {}
}

export interface PaymentData {
  paymentId: string;
  subscriptionPaymentId: string;
  providerPriceId: string;
}

@CommandHandler(CreatePaymentsCommand)
export class CreatePaymentsCommandHandler
  implements ICommandHandler<CreatePaymentsCommand>
{
  public constructor(
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
  ) {}

  public async execute(command: CreatePaymentsCommand) {
    const { priceId, provider, subscriptionType, tx, userId } = command.data;

    const pricingPlan =
      await this.subscriptionsQueryRepository.getSubscriptionPricingPlanByQuery(
        {
          priceId,
          provider,
          subscriptionType,
        },
      );

    const { currency, value: price } = <SubscriptionPrice>(
      await this.subscriptionsQueryRepository.getSubscriptionPriceById(priceId)
    );

    if (!pricingPlan)
      throw new NotFoundException('Pricing plan for subscription not found');

    const { id: pricingPlanId, providerPriceId } = pricingPlan;

    const payment = await this.subscriptionsTransactionService.createPayments(
      tx,
      {
        userId,
        price,
        currency,
        pricingPlanId,
        provider: provider,
        status: PaymentStatus.PENDING,
      },
    );

    return {
      paymentId: payment.id,
      subscriptionPaymentId: <string>payment.subscriptionPayment?.id,
      providerPriceId,
    };
  }
}
