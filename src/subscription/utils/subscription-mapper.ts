import { Subscription } from '@prisma/client';
import { formatDate } from './format-date';

export class SubscriptionMapper {
  public static toViewModel<T extends Partial<Subscription>>(subscription: T) {
    const { startDate, endDate } = subscription;

    return {
      startDate: formatDate(<Date>startDate),
      endDate: formatDate(<Date>endDate),
    };
  }
}
