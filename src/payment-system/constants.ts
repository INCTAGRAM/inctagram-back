import Stripe from 'stripe';

export const STRIPE_TOKEN = 'STRIPE_TOKEN';
export const API_VERSION: Stripe.LatestApiVersion = '2022-11-15';
export const STRIPE_OPTIONS_TOKEN = 'STRIPE__OPTIONS';

export const PAYPAL_TOKEN = 'PAYPAL_TOKEN';
export const PAYPAL_OPTIONS_TOKEN = 'PAYPAL_OPTIONS_TOKEN';

export enum PaypalEnvironment {
  SANDBOX = 'SANDBOX',
  LIVE = 'LIVE',
}
