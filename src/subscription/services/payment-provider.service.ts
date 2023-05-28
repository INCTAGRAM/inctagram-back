import Stripe from 'stripe';

export abstract class PaymentProviderService {
  public abstract provider: string;

  public abstract cancelSubscription(
    id: string,
    reason?: string,
  ): Promise<void>;

  public abstract createCustomerIfNotExists(
    email: string,
    username: string,
  ): Promise<Stripe.Customer>;
}
