import { Injectable } from '@nestjs/common';
import {
  SubscriptionType,
  SubscriptionStatus,
  AccountPlan,
  PaymentStatus,
  SubscriptionPrice,
} from '@prisma/client';

import { Handler } from '../abstract.handler';
import {
  StripeCheckoutSessionObject,
  StripeEvent,
} from '../../interfaces/events.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CHECKOUT_SESSION_COMPLETED } from '../../constants';
import { UserRepository } from 'src/user/repositories/user.repository';
import { SubscriptionsQueryRepository } from 'src/subscription/repositories/subscriptions.query-repository';
import { SubscriptionsTransactionService } from 'src/subscription/services/subscriptions-transaction.service';
import { calculateSubscriptionEndDate } from 'src/subscription/utils/calculate-subscription-end-date';

@Injectable()
export class CheckoutSessinCompletedEventHandler extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeCheckoutSessionObject>,
  ): Promise<boolean> {
    if (event.type === CHECKOUT_SESSION_COMPLETED) {
      const { mode, payment_status: paymentStatus } = event.data.object;

      if (paymentStatus === 'paid' && mode === 'payment') {
        const { subscriptionId, paymentId } = event.data.object.metadata;

        await this.prismaService.$transaction(async (tx) => {
          const currentPendingSubscription =
            await this.subscriptionsQueryRepository.getSubscriptionByQuery({
              id: subscriptionId,
              status: SubscriptionStatus.PENDING,
            });

          if (currentPendingSubscription) {
            const { userId } = currentPendingSubscription;

            const currentActiveSubscription =
              await this.subscriptionsQueryRepository.getSubscriptionByQuery({
                userId,
                status: SubscriptionStatus.ACTIVE,
              });

            if (currentActiveSubscription?.type === SubscriptionType.ONETIME) {
              await this.subscriptionsTransactionService.cancelSubscription(
                tx,
                currentActiveSubscription.id,
              );
            }

            const { subscriptionPayment } =
              await this.subscriptionsTransactionService.updatePayments(
                tx,
                paymentId,
                {
                  status: PaymentStatus.CONFIRMED,
                },
              );

            const subscriptionPriceId = <string>(
              subscriptionPayment?.pricingPlan.priceId
            );

            const currentDate = new Date();
            let currentEndDate =
              currentActiveSubscription?.endDate || currentDate;

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

            await Promise.all([
              this.subscriptionsTransactionService.updateSubscription(
                tx,
                subscriptionId,
                {
                  status: SubscriptionStatus.ACTIVE,
                  createdAt: new Date(),
                  endDate: newEndDate,
                },
              ),
              this.userRepository.updateAccountPlan(
                tx,
                userId,
                AccountPlan.BUSINESS,
              ),
            ]);
          }
        });

        return false;
      }
    }

    return true;
  }
}
