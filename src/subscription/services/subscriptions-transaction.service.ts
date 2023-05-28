import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentReference,
  Prisma,
  Subscription,
  SubscriptionPayment,
  SubscriptionStatus,
} from '@prisma/client';

import { PrismaTransactionType } from 'src/common/types';

@Injectable()
export class SubscriptionsTransactionService {
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

    return tx.subscription.create({
      data: {
        type,
        userId,
        subscriptionPaymentId,
        status,
        endDate,
      },
    });
  }

  public async cancelSubscription(tx: PrismaTransactionType, id: string) {
    await tx.subscription.update({
      where: {
        id,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });
  }

  public async updatePayments(
    tx: PrismaTransactionType,
    id: string,
    updates: Pick<Payment, 'status'> & {
      invoice?: string;
      invoiceUrl?: string;
    },
  ) {
    const { status, invoice, invoiceUrl } = updates;

    return tx.payment.update({
      where: { id },
      data: {
        status,
        subscriptionPayment: {
          update: {
            info: <Prisma.JsonObject>{
              invoice,
              invoiceUrl,
            },
          },
        },
      },
      include: {
        subscriptionPayment: {
          select: {
            id: true,
            pricingPlan: {
              select: {
                id: true,
                priceId: true,
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
      Pick<SubscriptionPayment, 'pricingPlanId'> &
      Partial<Pick<Payment, 'reference'>>,
  ) {
    const {
      userId,
      currency,
      price,
      provider,
      status,
      pricingPlanId,
      reference = PaymentReference.SUBSCRIPTION,
    } = payload;

    return tx.payment.create({
      data: {
        userId,
        currency,
        price,
        provider,
        status,
        reference,
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
            pricingPlan: {
              select: {
                id: true,
                priceId: true,
              },
            },
          },
        },
      },
    });
  }

  public async updateSubscription(
    tx: PrismaTransactionType,
    id: string,
    updates: Partial<
      Pick<
        Subscription,
        'endDate' | 'relatedSubscription' | 'status' | 'startDate' | 'createdAt'
      >
    >,
  ) {
    return tx.subscription.update({
      where: { id },
      data: updates,
    });
  }
}
