import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionStatus } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentProviderService } from '../services/payment-provider.service';
import { InjectStripeService } from 'src/common/decorators/inject-stripe-service.decorator';
import { SubscriptionsQueryRepository } from '../repositories/subscriptions.query-repository';
import { SubscriptionsTransactionService } from '../services/subscriptions-transaction.service';

export class CancelSubscriptionCommand {
  public constructor(public readonly userId: string) {}
}

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionCommandHandler
  implements ICommandHandler<CancelSubscriptionCommand>
{
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    @InjectStripeService()
    private readonly paymentProviderService: PaymentProviderService,
    private readonly subscriptionsTransactionService: SubscriptionsTransactionService,
  ) {}

  public async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const currentActiveSubscription =
      await this.subscriptionsQueryRepository.getSubscriptionByQuery({
        userId,
        status: SubscriptionStatus.ACTIVE,
      });

    if (currentActiveSubscription) {
      await Promise.all([
        this.subscriptionsTransactionService.cancelSubscription(
          this.prismaService,
          currentActiveSubscription.id,
        ),
        this.paymentProviderService.cancelSubscription(
          <string>currentActiveSubscription.relatedSubscription,
        ),
      ]);
    }
  }
}
