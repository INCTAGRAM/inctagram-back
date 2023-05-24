import { PaypalOptions } from './paypal-options.interface';

export interface PaypalOptionsFactory {
  createStripeOptions(): Promise<PaypalOptions> | PaypalOptions;
}
