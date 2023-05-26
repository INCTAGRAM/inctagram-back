import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentProviderService } from '../services/payment-provider.service';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';

export class CancelSubscriptionCommand {
  public constructor(public readonly userId: string) {}
}

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler
  implements ICommandHandler<CancelSubscriptionCommand>
{
  public constructor(
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    @InjectStripeService()
    private readonly paymentProviderService: PaymentProviderService,
  ) {}

  public async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const providersSubscriptionId =
      await this.subscriptionsQueryRepository.getProvidersSubscriptionId({
        userId,
      });

    if (providersSubscriptionId) {
      await this.paymentProviderService.cancelSubscription(
        providersSubscriptionId,
      );
    }
  }
}
