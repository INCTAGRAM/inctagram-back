import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { SubscriptionController } from './subscription.controller';
import { StripePaymentStrategy } from './payment-strategies/stripe.strategy';
import { PaymentSystemModule } from 'src/payment-system/payment-system.module';
import { StartPaymentCommandHandler } from './use-cases/start-payment.use-case';
import { PaymentStrategiesProvider } from './providers/payment-strategies.provider';
import { ProcessPaymentCommandHanlder } from './use-cases/process-payment.use-case';
import { SubscriptionsQueryRepository } from './repositories/subscriptions.query-repository';
import {
  webhookEventHandlers,
  WebhookEventHandlersProvider,
} from './providers/webhook-event-handlers.provider';
import { STRIPE_PAYMENT_SERVICE } from 'src/common/constants';
import { UserRepository } from 'src/user/repositories/user.repository';
import { PaymentServicesProvider } from './providers/payment-services.provider';
import { StripePaymentService } from './services/stripe-payment-provider.service';
import { CancelSubscriptionCommandHandler } from './use-cases/cancel-subscription.use-case';
import { CreatePaymentsCommandHandler } from './use-cases/create-payments.use-case';
import { SubscriptionsTransactionService } from './services/subscriptions-transaction.service';
import { ValidatePaymentInputCommandHandler } from './use-cases/validate-payment-input.use-case';
import { CreateCustomerIfNotExistsCommandHandler } from './use-cases/create-customer-if-not-exists.use-case';
import { ProcessActiveSubscriptionPaymentCommandHandler } from './use-cases/process-active-subscription-payment.use-case';
import { ProcessPendingSubscriptionPaymentCommandHandler } from './use-cases/process-pending-subscription-payment.use-case';

const commandHandlers = [
  StartPaymentCommandHandler,
  ProcessPaymentCommandHanlder,
  CreatePaymentsCommandHandler,
  CancelSubscriptionCommandHandler,
  ValidatePaymentInputCommandHandler,
  CreateCustomerIfNotExistsCommandHandler,
  ProcessPendingSubscriptionPaymentCommandHandler,
  ProcessActiveSubscriptionPaymentCommandHandler,
];

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
    UserRepository,
    StripePaymentService,
    StripePaymentStrategy,
    PaymentServicesProvider,
    PaymentStrategiesProvider,
    WebhookEventHandlersProvider,
    SubscriptionsQueryRepository,
    SubscriptionsTransactionService,
    {
      provide: STRIPE_PAYMENT_SERVICE,
      useClass: StripePaymentService,
    },
  ],
})
export class SubscriptionModule {}
