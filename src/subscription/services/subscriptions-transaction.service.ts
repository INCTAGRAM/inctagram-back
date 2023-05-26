import { Injectable } from '@nestjs/common';
import {
  Payment,
  Prisma,
  Subscription,
  SubscriptionPayment,
  SubscriptionStatus,
} from '@prisma/client';

import { PrismaTransactionType } from 'src/common/types';
import { PaymentProviderService } from './payment-provider.service';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';

@Injectable()
export class SubscriptionsTransactionService {
  public constructor(
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    @InjectStripeService()
    private readonly paymentProviderService: PaymentProviderService,
  ) {}

  public async createSubscription(
    tx: PrismaTransactionType,
    payload: Pick<Subscription, 'userId' | 'subscriptionPaymentId'> &
      Partial<Pick<Subscription, 'endDate'>> &
      Pick<Subscription, 'type' | 'status'>,
  ) {
    const {
      type,
      userId,
      endDate = null,
      subscriptionPaymentId,
      status = SubscriptionStatus.ACTIVE,
    } = payload;

    await tx.subscription.create({
      data: {
        type,
        userId,
        subscriptionPaymentId,
        status,
        endDate,
      },
    });
  }

  public async cancelSubscription(
    tx: PrismaTransactionType,
    id: string,
    relatedSubscriptionId: string | null = null,
  ) {
    relatedSubscriptionId ||=
      await this.subscriptionsQueryRepository.getProvidersSubscriptionId({
        id,
      });

    await tx.subscription.update({
      where: {
        id,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    if (relatedSubscriptionId) {
      await this.paymentProviderService.cancelSubscription(
        relatedSubscriptionId,
      );
    }
  }

  public async updatePayments(
    tx: PrismaTransactionType,
    id: string,
    updates: Pick<Payment, 'status'> & {
      invoice?: string;
    },
  ) {
    const { status, invoice } = updates;
    return tx.payment.update({
      where: { id },
      data: {
        status,
        subscriptionPayment: {
          update: {
            info: <Prisma.JsonObject>{
              invoice,
            },
          },
        },
      },
      include: {
        subscriptionPayment: {
          select: {
            id: true,
            pricingPlan: {
              include: {
                price: {
                  select: {
                    period: true,
                    periodType: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  public async createPayments(
    tx: PrismaTransactionType,
    payload: Pick<
      Payment,
      'userId' | 'currency' | 'price' | 'provider' | 'status'
    > &
      Pick<SubscriptionPayment, 'pricingPlanId'>,
  ) {
    const { userId, currency, price, provider, status, pricingPlanId } =
      payload;

    return tx.payment.create({
      data: {
        userId,
        currency,
        price,
        provider,
        status,
        subscriptionPayment: {
          create: {
            pricingPlanId,
          },
        },
      },
      include: {
        subscriptionPayment: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public async updateSubscription(
    tx: PrismaTransactionType,
    id: string,
    updates: Partial<
      Pick<Subscription, 'endDate' | 'relatedSubscription' | 'status'>
    >,
  ) {
    return tx.subscription.update({
      where: { id },
      data: updates,
    });
  }
}
