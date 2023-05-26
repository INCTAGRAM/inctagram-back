import { SubscriptionType } from '@prisma/client';

export interface CurrentSubscriptionDbType {
  id: string;
  endDate: Date | null;
  startDate: Date;
  subscriptionPayment: {
    pricingPlan: {
      subscriptionType: SubscriptionType;
    };
  } | null;
}

export interface CurrentSubscriptionViewModelType {
  paymentDate: string;
  endDate: string;
}
