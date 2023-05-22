import { Provider } from '@nestjs/common';

import { PAYMENT_STRATEGIES } from '../constants';

export const PaymentStrategiesProvider: Provider = {
  provide: PAYMENT_STRATEGIES,
  useFactory() {
    return [];
  },
  inject: [],
};
