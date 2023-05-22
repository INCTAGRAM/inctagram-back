import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  PaymentProvider,
  PaymentStatus,
  SubscriptionPrice,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';
import Stripe from 'stripe';

import {
  PaymentCommand,
  PaymentStrategy,
} from '../payment-strategies/abstract.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { getUnixTimestamp } from 'src/user/utils/unix-timestamp';
import { subscriptionsConfig } from 'src/config/subscriptions.config';
import { InjectStripe } from 'src/common/decorators/inject-stripe.decorator';
import { PaymentException } from 'src/common/exceptions/subscriptions.exception';

export interface CheckoutMetadata extends Stripe.MetadataParam {
  userId: string;
  paymentId: string;
}

@Injectable()
export class StripePaymentStrategy extends PaymentStrategy {
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    @Inject(subscriptionsConfig.KEY)
    private subscriptionsConf: ConfigType<typeof subscriptionsConfig>,
  ) {
    super();
  }

  public name = PaymentProvider.STRIPE;

  public async execute(command: PaymentCommand) {
    try {
      const { userId, priceId, renew } = command;

      const pricingPlan = await this.prisma.subscriptionPricingPlan.findFirst({
        where: {
          priceId,
          provider: this.name,
          subscriptionType: renew ? 'RECCURING' : 'ONETIME',
        },
      });

      const { currency, value, period } = <SubscriptionPrice>(
        await this.prisma.subscriptionPrice.findFirst({
          where: {
            id: priceId,
          },
        })
      );

      if (!pricingPlan)
        throw new NotFoundException('Pricing plan for subscription not found');

      const { id: planId, providerPriceId } = pricingPlan;

      let billingTimestamp: number;

      if (renew) {
        const currentSubscription = await this.prisma.subscription.findFirst({
          where: {
            userId,
            status: SubscriptionStatus.ACTIVE,
            type: SubscriptionType.RECCURING,
          },
        });

        billingTimestamp = getUnixTimestamp(
          (currentSubscription?.startDate || new Date()) > new Date()
            ? currentSubscription!.endDate
            : new Date(),
        );
      }

      console.log(this.subscriptionsConf.successUrl);

      return this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId,
            currency,
            price: value,
            provider: this.name,
            status: PaymentStatus.PENDING,
            subscriptionPayment: {
              create: {
                period,
                pricingPlanId: planId,
              },
            },
          },
        });

        const checkoutSession: Stripe.Checkout.SessionCreateParams = {
          line_items: [
            {
              price: providerPriceId,
              quantity: 1,
            },
          ],
          metadata: {
            paymentId: payment.id,
          },
          client_reference_id: payment.id,
          expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
          mode: renew ? 'subscription' : 'payment',
          success_url: this.subscriptionsConf.successUrl,
          cancel_url: this.subscriptionsConf.cancelUrl,
        };

        if (renew) {
          checkoutSession.subscription_data = {
            trial_end: billingTimestamp,
          };
        }

        const session = await this.stripe.checkout.sessions.create(
          checkoutSession,
        );

        return session.url;
      });
    } catch (error) {
      console.log(error);

      throw new PaymentException();
    }
  }
}
