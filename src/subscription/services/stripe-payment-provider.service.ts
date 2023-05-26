import { InternalServerErrorException } from '@nestjs/common';
import { SubscriptionType } from '@prisma/client';
import Stripe from 'stripe';

import { PaymentProviderService } from './payment-provider.service';
import { InjectStripeClient } from 'src/common/decorators/inject-stripe-client.decorator';

export class StripePaymentProviderService extends PaymentProviderService {
  public constructor(@InjectStripeClient() private readonly stripe: Stripe) {
    super();
  }

  public async cancelSubscription(id: string, reason?: string): Promise<void> {
    await this.stripe.subscriptions
      .del(id, {
        cancellation_details: {
          comment: !reason ? 'Cancel subscription' : reason,
        },
      })
      .then(console.log)
      .catch((e) => new InternalServerErrorException(e));
  }

  public async updateSubscriptionType(
    id: string,
    type: SubscriptionType,
  ): Promise<void> {
    await this.stripe.subscriptions
      .update(id, {
        cancel_at_period_end: type === SubscriptionType.ONETIME ? true : false,
      })
      .then(console.log)
      .catch((e) => new InternalServerErrorException(e));
  }
}
