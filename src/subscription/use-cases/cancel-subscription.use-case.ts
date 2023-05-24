import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

import { InjectStripe } from 'src/common/decorators/inject-stripe.decorator';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';

export class CancelSubscriptionCommand {
  public constructor(public readonly userId: string) {}
}

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler
  implements ICommandHandler<CancelSubscriptionCommand>
{
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {}

  public async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const providersSubscriptionId =
      await this.subscriptionsQueryRepository.getProvidersSubscriptionId(
        userId,
      );

    if (providersSubscriptionId) {
      await this.stripe.subscriptions
        .del(providersSubscriptionId, {
          cancellation_details: {
            comment: "Cancellation upon user's request.",
          },
        })
        .catch(() => new BadRequestException());
    }
  }
}
