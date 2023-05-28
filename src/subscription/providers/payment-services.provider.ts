import { Provider } from '@nestjs/common';

import { PAYMENT_SERVICES } from '../constants';
import { StripePaymentService } from '../services/stripe-payment-provider.service';

export const PaymentServicesProvider: Provider = {
  provide: PAYMENT_SERVICES,
  useFactory(stripePaymentService: StripePaymentService) {
    return [stripePaymentService];
  },
  inject: [StripePaymentService],
};
