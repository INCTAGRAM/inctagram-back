import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  SubscriptionType,
  SubscriptionStatus,
  AccountPlan,
  PeriodType,
} from '@prisma/client';

import { Handler } from '../abstract.handler';
import {
  StripeCheckoutSessionObject,
  StripeEvent,
} from '../../interfaces/events.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CHECKOUT_SESSION_COMPLETED } from '../../constants';
import { UserRepository } from 'src/user/repositories/user.repository';
import { calculateSubscriptionEndDate } from 'src/subscription/utils/calculate-subscription-end-date';
import { SubscriptionsTransactionService } from 'src/subscription/services/subscriptions-transaction.service';
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';
import { PaymentProviderService } from 'src/subscription/services/payment-provider.service';
import { SubscriptionsQueryRepository } from 'src/subscription/repositories/subscriptions.query-repository';

@Injectable()
export class CheckoutSessinCompletedEventHandler extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    @InjectStripeService()
    private readonly paymentProviderService: PaymentProviderService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeCheckoutSessionObject>,
  ): Promise<boolean> {
    if (event.type === CHECKOUT_SESSION_COMPLETED) {
      const {
        mode,
        payment_status: paymentStatus,
        invoice,
      } = event.data.object;

      if (mode === 'subscription' && paymentStatus === 'paid') {
        const { paymentId, userId } = event.data.object.metadata;
        const { subscription: providerSubscriptionId } = event.data.object;

        const status = PaymentStatus.CONFIRMED;

        await this.prismaService.$transaction(async (tx) => {
          const updatedPayments =
            await this.subscriptionsTransactionService.updatePayments(
              tx,
              paymentId,
              {
                status,
                invoice,
              },
            );

          const lastActiveSubscription = await tx.subscription.findFirst({
            where: {
              userId,
              status: SubscriptionStatus.ACTIVE,
            },
          });

          const period =
            updatedPayments.subscriptionPayment?.pricingPlan.price.period || 0;
          const periodType =
            updatedPayments.subscriptionPayment?.pricingPlan.price.periodType ||
            PeriodType.MONTH;

          if (lastActiveSubscription) {
            await this.subscriptionsTransactionService.cancelSubscription(
              tx,
              lastActiveSubscription.id,
            );
          }

          const currentActiveSubscriptionEndDate =
            lastActiveSubscription?.endDate;

          const currentDate = new Date();

          const newEndDate =
            currentActiveSubscriptionEndDate &&
            currentActiveSubscriptionEndDate > currentDate
              ? calculateSubscriptionEndDate(
                  currentActiveSubscriptionEndDate,
                  period,
                  periodType,
                )
              : calculateSubscriptionEndDate(currentDate, period, periodType);

          const currentPendingSubscription =
            await this.subscriptionsQueryRepository.getSubscriptionByQuery({
              subscriptionPaymentId: updatedPayments.subscriptionPayment?.id,
              status: SubscriptionStatus.PENDING,
            });

          await Promise.all([
            this.subscriptionsTransactionService.updateSubscription(
              tx,
              <string>currentPendingSubscription?.id,
              {
                endDate: newEndDate,
                status: SubscriptionStatus.ACTIVE,
              },
            ),
            this.paymentProviderService.updateSubscriptionType(
              <string>providerSubscriptionId,
              SubscriptionType.ONETIME,
            ),
            this.userRepository.updateAccountPlan(
              tx,
              userId,
              AccountPlan.BUSINESS,
            ),
          ]);
        });

        return false;
      }
    }

    return true;
  }
}
