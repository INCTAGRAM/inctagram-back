import { SubscriptionStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Handler } from '../abstract.handler';
import {
  StripeEvent,
  StripeSubscriptionObject,
} from '../../interfaces/events.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CUSTOMER_SUBSCRIPTION_DELETED } from '../../constants';
import { SubscriptionsTransactionService } from 'src/subscription/services/subscriptions-transaction.service';
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';
import { SubscriptionsQueryRepository } from 'src/subscription/repositories/subscriptions.query-repository';

@Injectable()
export class CustomerSubscriptionDeletedEventHandler extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
    @InjectStripeService()
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeSubscriptionObject>,
  ): Promise<boolean> {
    if (event.type === CUSTOMER_SUBSCRIPTION_DELETED) {
      const { id: relatedSubscription } = event.data.object;

      const subscription =
        await this.subscriptionsQueryRepository.getSubscriptionByQuery({
          status: SubscriptionStatus.ACTIVE,
          relatedSubscription,
        });

      if (subscription) {
        await this.subscriptionsTransactionService.cancelSubscription(
          this.prismaService,
          subscription.id,
        );
      }

      return false;
    }

    return true;
  }
}
