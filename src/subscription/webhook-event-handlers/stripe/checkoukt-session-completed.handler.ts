import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  Prisma,
  Subscription,
  PaymentStatus,
  SubscriptionType,
  SubscriptionStatus,
  AccountPlan,
} from '@prisma/client';

import { Handler } from '../abstract.handler';
import {
  StripeCheckoutSessionObject,
  StripeEvent,
} from '../../interfaces/events.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CHECKOUT_SESSION_COMPLETED } from '../../constants';
import { InjectStripe } from 'src/common/decorators/inject-stripe.decorator';
import { calculateSubscriptionEndDate } from 'src/subscription/utils/calculate-subscription-end-date';

@Injectable()
export class CheckoutSessinCompletedEventHandler extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    @InjectStripe() private readonly stripe: Stripe,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeCheckoutSessionObject>,
  ): Promise<boolean> {
    if (
      event.type === CHECKOUT_SESSION_COMPLETED &&
      event.data.object.payment_status === 'paid'
    ) {
      const { paymentId, userId } = event.data.object.metadata;
      const status = PaymentStatus.CONFIRMED;

      await this.prismaService.$transaction(async (tx) => {
        const updatedPayments = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status,
            subscriptionPayment: {
              update:
                event.data.object.mode === 'subscription'
                  ? {
                      info: <Prisma.JsonObject>{
                        payment_intent: event.data.object.payment_intent,
                      },
                      providerSubscriptionId: event.data.object.subscription,
                    }
                  : {
                      info: <Prisma.JsonObject>{
                        payment_intent: event.data.object.payment_intent,
                      },
                    },
            },
          },
          include: {
            subscriptionPayment: {
              select: {
                id: true,
                period: true,
              },
            },
          },
        });

        const currentSubscription = await tx.subscription.findFirst({
          where: {
            userId,
            status: SubscriptionStatus.ACTIVE,
          },
        });

        if (currentSubscription) {
          await this.cancelCurrentSubscription(tx, currentSubscription);
        }

        const subscriptionEndDate = calculateSubscriptionEndDate(
          currentSubscription?.endDate &&
            currentSubscription?.endDate > new Date()
            ? currentSubscription?.endDate
            : new Date(),
          <number>updatedPayments.subscriptionPayment?.period,
        );

        await Promise.all([
          this.createNewSubscription(tx, {
            userId,
            subscriptionPaymentId: <string>(
              updatedPayments.subscriptionPayment?.id
            ),
            type:
              event.data.object.mode === 'subscription'
                ? SubscriptionType.RECCURING
                : SubscriptionType.ONETIME,
            endDate: subscriptionEndDate,
          }),
          tx.user.update({
            where: {
              id: userId,
            },
            data: {
              accountPlan: AccountPlan.BUSINESS,
            },
          }),
        ]);
      });

      return false;
    }

    return true;
  }

  private async cancelCurrentSubscription(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    currentSubscription: Subscription,
  ) {
    const providerSubscriptionId = (
      await tx.subscriptionPayment.findUnique({
        where: {
          id: currentSubscription.subscriptionPaymentId,
        },
      })
    )?.providerSubscriptionId;

    if (providerSubscriptionId) {
      console.log(providerSubscriptionId, 'sub id');
      await this.stripe.subscriptions
        .del(providerSubscriptionId, {
          cancellation_details: {
            comment: 'Cancel subscription',
          },
        })
        .then(console.log, console.log);
    }

    await tx.subscription.update({
      where: {
        id: currentSubscription.id,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });
  }

  private async createNewSubscription(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    payload: {
      userId: string;
      subscriptionPaymentId: string;
      type: SubscriptionType;
      endDate: Date;
    },
  ) {
    const { userId, subscriptionPaymentId, type, endDate } = payload;

    await tx.subscription.create({
      data: {
        userId,
        subscriptionPaymentId,
        status: SubscriptionStatus.ACTIVE,
        type,
        endDate,
      },
    });
  }
}
