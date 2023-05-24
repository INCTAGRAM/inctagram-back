import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { SubscriptionController } from './subscription.controller';
import { CreatePaymentHandler } from './use-cases/create-payment.use-case';
import { StripePaymentStrategy } from './payment-strategies/stripe.strategy';
import { ProcessPaymentHandler } from './use-cases/process-payment.user-case';
import { PaymentSystemModule } from 'src/payment-system/payment-system.module';
import { PaymentStrategiesProvider } from './providers/payment-strategies.provider';
import { SubscriptionsQueryRepository } from './repositories/subscriptions.query-repository';
import {
  webhookEventHandlers,
  WebhookEventHandlersProvider,
} from './providers/webhook-event-handlers.provider';

const commandHandlers = [CreatePaymentHandler, ProcessPaymentHandler];

@Module({
  imports: [
    CqrsModule,
    PaymentSystemModule.setupStripeAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: <string>configService.get('stripe.apiKey'),
        apiVersion: '2022-11-15',
      }),
      inject: [ConfigService],
    }),
    PaymentSystemModule.setupPaypalAsync({
      useFactory: (configService: ConfigService) => ({
        clientId: <string>configService.get('paypal.clientId'),
        clientSecret: <string>configService.get('paypal.clientSecret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SubscriptionController],
  providers: [
    ...commandHandlers,
    ...webhookEventHandlers,
    StripePaymentStrategy,
    PaymentStrategiesProvider,
    WebhookEventHandlersProvider,
    SubscriptionsQueryRepository,
  ],
})
export class SubscriptionModule {}
