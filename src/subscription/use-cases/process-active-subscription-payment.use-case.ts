import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import {
  Payment,
  PaymentProvider,
  PaymentStatus,
  SubscriptionPrice,
  SubscriptionStatus,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { calculateSubscriptionEndDate } from '../utils/calculate-subscription-end-date';
import { InjectStripeClient } from 'src/common/decorators/inject-stripe-client.decorator';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { SubscriptionsTransactionService } from '../services/subscriptions-transaction.service';

export class ProcessActiveSubscriptionPaymentCommand {
  public constructor(public readonly relatedSubscription: string) {}
}

@CommandHandler(ProcessActiveSubscriptionPaymentCommand)
export class ProcessActiveSubscriptionPaymentCommandHandler
  implements ICommandHandler<ProcessActiveSubscriptionPaymentCommand>
{
  public constructor(
    @InjectStripeClient() private readonly stripe: Stripe,
    private readonly prismaService: PrismaService,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {}

  public async execute(command: ProcessActiveSubscriptionPaymentCommand) {
    const { relatedSubscription } = command;

    await this.prismaService.$transaction(async (tx) => {
      const currentActiveSubscription =
        await this.subscriptionsQueryRepository.getSubscriptionByQuery({
          relatedSubscription,
          status: SubscriptionStatus.ACTIVE,
        });

      if (!currentActiveSubscription) {
        throw new InternalServerErrorException(
          'Cannot proceed with the payment process. Please call support.',
        );
      }

      const {
        id: subscriptionId,
        subscriptionPayment: { id: subscriptionPaymentId, paymentId },
        userId,
        type,
      } = currentActiveSubscription;

      const [{ pricingPlanId }, { price, currency, reference }] =
        await Promise.all([
          this.subscriptionsQueryRepository.getSubscriptionPaymentByQuery({
            id: subscriptionPaymentId,
          }),
          <Payment>await this.subscriptionsQueryRepository.getPaymentByQuery({
            id: paymentId,
          }),
        ]);

      // const stripeSubscription = await this.stripe.subscriptions.retrieve(
      //   relatedSubscription,
      // );

      const { subscriptionPayment } =
        await this.subscriptionsTransactionService.createPayments(tx, {
          currency,
          price,
          userId,
          reference,
          pricingPlanId,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.CONFIRMED,
        });

      const [{ id: createdSubscriptionId }] = await Promise.all([
        this.subscriptionsTransactionService.createSubscription(tx, {
          userId,
          type,
          status: SubscriptionStatus.PENDING,
          subscriptionPaymentId: <string>subscriptionPayment?.id,
        }),
        this.subscriptionsTransactionService.cancelSubscription(
          tx,
          subscriptionId,
        ),
      ]);

      const subscriptionPriceId = <string>(
        subscriptionPayment?.pricingPlan.priceId
      );

      const currentEndDate = new Date();

      const { period, periodType } = <SubscriptionPrice>(
        await this.subscriptionsQueryRepository.getPriceById(
          subscriptionPriceId,
        )
      );

      const newEndDate = calculateSubscriptionEndDate(
        currentEndDate,
        period,
        periodType,
      );

      await this.subscriptionsTransactionService.updateSubscription(
        tx,
        createdSubscriptionId,
        {
          endDate: newEndDate,
          status: SubscriptionStatus.ACTIVE,
        },
      );
    });
  }
}
