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
import { subscriptionsConfig } from 'src/config/subscriptions.config';
import { PaymentException } from 'src/common/exceptions/subscriptions.exception';
import { InjectStripeClient } from 'src/common/decorators/inject-stripe-client.decorator';
import { SubscriptionsTransactionService } from '../services/subscriptions-transaction.service';

export interface CheckoutMetadata extends Stripe.MetadataParam {
  userId: string;
  paymentId: string;
}

@Injectable()
export class StripePaymentStrategy extends PaymentStrategy {
  public constructor(
    @InjectStripeClient() private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    @Inject(subscriptionsConfig.KEY)
    private subscriptionsConf: ConfigType<typeof subscriptionsConfig>,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
  ) {
    super();
  }

  public name = PaymentProvider.STRIPE;

  public async execute(command: PaymentCommand) {
    try {
      const { userId, priceId } = command;

      const pricingPlan = await this.prisma.subscriptionPricingPlan.findFirst({
        where: {
          priceId,
          provider: this.name,
          subscriptionType: SubscriptionType.RECCURING,
        },
      });

      const { currency, value: price } = <SubscriptionPrice>(
        await this.prisma.subscriptionPrice.findFirst({
          where: {
            id: priceId,
          },
        })
      );

      if (!pricingPlan)
        throw new NotFoundException('Pricing plan for subscription not found');

      const { id: pricingPlanId, providerPriceId } = pricingPlan;

      return this.prisma.$transaction(async (tx) => {
        const payment =
          await this.subscriptionsTransactionService.createPayments(tx, {
            userId,
            currency,
            price,
            pricingPlanId,
            provider: this.name,
            status: PaymentStatus.PENDING,
          });

        await this.subscriptionsTransactionService.createSubscription(tx, {
          subscriptionPaymentId: <string>payment.subscriptionPayment?.id,
          userId: userId,
          type: SubscriptionType.ONETIME,
          status: SubscriptionStatus.PENDING,
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
            userId: userId,
          },
          client_reference_id: payment.id,
          expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
          mode: 'subscription',
          success_url: this.subscriptionsConf.successUrl,
          cancel_url: this.subscriptionsConf.cancelUrl,
        };

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
