import paypal from '@paypal/checkout-server-sdk';
import { PaypalEnvironment } from '../constants';

import type { PaypalOptions } from '../interfaces';

export const createPaypalClient = (options: PaypalOptions) => {
  const { clientId, clientSecret } = options;

  let environment: paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment;

  if (process.env.PAYPAL_ENVIRONMENT === PaypalEnvironment.SANDBOX) {
    environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  } else {
    environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.PayPalHttpClient(environment);
};
