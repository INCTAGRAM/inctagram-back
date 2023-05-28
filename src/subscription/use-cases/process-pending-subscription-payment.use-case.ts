import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PaymentStatus,
  SubscriptionPrice,
  SubscriptionStatus,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CancelSubscriptionCommand } from './cancel-subscription.use-case';
import { calculateSubscriptionEndDate } from '../utils/calculate-subscription-end-date';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { SubscriptionsTransactionService } from '../services/subscriptions-transaction.service';

export class ProcessPendingSubscriptionPaymentCommand {
  public constructor(
    public readonly subscriptionId: string,
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly invoiceData: {
      invoice: string;
      invoiceUrl: string;
    },
  ) {}
}

@CommandHandler(ProcessPendingSubscriptionPaymentCommand)
export class ProcessPendingSubscriptionPaymentCommandHandler
  implements ICommandHandler<ProcessPendingSubscriptionPaymentCommand>
{
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly prismaService: PrismaService,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {}

  public async execute(command: ProcessPendingSubscriptionPaymentCommand) {
    const {
      subscriptionId,
      paymentId,
      userId,
      invoiceData: { invoice, invoiceUrl },
    } = command;

    await this.prismaService.$transaction(async (tx) => {
      const currentActiveSubscription =
        await this.subscriptionsQueryRepository.getSubscriptionByQuery({
          userId,
          status: SubscriptionStatus.ACTIVE,
        });

      if (currentActiveSubscription) {
        await this.commandBus.execute(new CancelSubscriptionCommand(userId));
      }

      const { subscriptionPayment } =
        await this.subscriptionsTransactionService.updatePayments(
          tx,
          paymentId,
          {
            status: PaymentStatus.CONFIRMED,
            invoice,
            invoiceUrl,
          },
        );

      const subscriptionPriceId = <string>(
        subscriptionPayment?.pricingPlan.priceId
      );

      const currentDate = new Date();
      let currentEndDate = currentActiveSubscription?.endDate || currentDate;

      currentEndDate =
        currentEndDate && currentEndDate > currentDate
          ? currentEndDate
          : currentDate;

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
        subscriptionId,
        {
          endDate: newEndDate,
          status: SubscriptionStatus.ACTIVE,
        },
      );
    });
  }
}
