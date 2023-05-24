import { StripeOptions } from './stripe-options.interface';

export interface StripeOptionsFactory {
  createStripeOptions(): Promise<StripeOptions> | StripeOptions;
}
