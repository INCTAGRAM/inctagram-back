import { Provider } from '@nestjs/common';

import { PAYMENT_STRATEGIES } from '../constants';
import { StripePaymentStrategy } from '../payment-strategies/stripe.strategy';

export const PaymentStrategiesProvider: Provider = {
  provide: PAYMENT_STRATEGIES,
  useFactory(stripeStrategy: StripePaymentStrategy) {
    return [stripeStrategy];
  },
  inject: [StripePaymentStrategy],
};
