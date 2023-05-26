import { SubscriptionType } from '@prisma/client';

export abstract class PaymentProviderService {
  public abstract cancelSubscription(
    id: string,
    reason?: string,
  ): Promise<void>;

  public abstract updateSubscriptionType(
    id: string,
    type: SubscriptionType,
  ): Promise<void>;
}
