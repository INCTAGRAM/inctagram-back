import Stripe from 'stripe';

import { StripeOptions } from '../interfaces';

export const createStripeClient = (options: StripeOptions) => {
  const { apiKey, ...opts } = options;

  return new Stripe(apiKey, opts);
};
