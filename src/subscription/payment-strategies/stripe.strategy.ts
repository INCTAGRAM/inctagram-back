import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
  PaymentProvider,
  PaymentStatus,
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
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';
import { CreateCustomerIfNotExistsCommand } from '../use-cases/create-customer-if-not-exists.use-case';
import {
  PaymentData,
  CreatePaymentsCommand,
} from '../use-cases/create-payments.use-case';

export interface CheckoutMetadata extends Stripe.MetadataParam {
  userId: string;
  paymentId: string;
}

@Injectable()
export class StripePaymentStrategy extends PaymentStrategy {
  public constructor(
    @InjectStripeClient() private readonly stripe: Stripe,
    @Inject(subscriptionsConfig.KEY)
    private subscriptionsConf: ConfigType<typeof subscriptionsConfig>,
    private readonly prisma: PrismaService,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  public provider = PaymentProvider.STRIPE;

  public async execute(command: PaymentCommand) {
    try {
      const { userId, priceId } = command;

      const customer = await this.commandBus.execute<
        CreateCustomerIfNotExistsCommand,
        Stripe.Customer
      >(new CreateCustomerIfNotExistsCommand(userId, this.provider));

      return this.prisma.$transaction(async (tx) => {
        const { paymentId, subscriptionPaymentId, providerPriceId } =
          await this.commandBus.execute<CreatePaymentsCommand, PaymentData>(
            new CreatePaymentsCommand({
              tx,
              priceId,
              userId,
              provider: this.provider,
              subscriptionType: SubscriptionType.ONETIME,
            }),
          );

        const subscription =
          await this.subscriptionsTransactionService.createSubscription(tx, {
            userId,
            type: SubscriptionType.ONETIME,
            status: SubscriptionStatus.PENDING,
            subscriptionPaymentId,
          });

        const checkoutSession: Stripe.Checkout.SessionCreateParams = {
          line_items: [
            {
              price: providerPriceId,
              quantity: 1,
            },
          ],
          metadata: {
            subscriptionId: subscription.id,
            paymentId,
          },
          payment_intent_data: {
            setup_future_usage: 'off_session',
          },
          payment_method_types: ['card'],
          customer: customer.id,
          expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
          mode: 'payment',
          success_url: this.subscriptionsConf.successUrl,
          cancel_url: this.subscriptionsConf.cancelUrl,
        };

        const session = await this.stripe.checkout.sessions.create(
          checkoutSession,
        );

        // const paymentMethods = await this.stripe.paymentMethods.list({
        //   customer: customer.id,
        //   type: 'card',
        // });

        // const subscription = await this.stripe.subscriptions.create({
        //   customer: customer.id,
        //   items: [
        //     {
        //       price: providerPriceId,
        //       quantity: 1,
        //     },
        //   ],
        //   default_payment_method: paymentMethods.data[0].id,
        // });

        // console.log(paymentMethods, 'payment methods');

        return session.url;
      });
    } catch (error) {
      console.log(error);

      throw new PaymentException();
    }
  }
}
