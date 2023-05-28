import {
  CurrentSubscriptionDbType,
  CurrentSubscriptionViewModelType,
} from '../interfaces';

export class SubscriptionsMapper {
  public static toViewModel(
    model: CurrentSubscriptionDbType,
  ): CurrentSubscriptionViewModelType {
    return {
      paymentDate: model.startDate.toISOString(),
      endDate: (model.endDate || new Date()).toISOString(),
    };
  }
}
