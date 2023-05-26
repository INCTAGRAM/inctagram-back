import type {
  PaymentProvider,
  PeriodType,
  SubscriptionPricingPlan,
} from '@prisma/client';

export interface Payments {
  id: string;
  price: number;
  provider: PaymentProvider;
  subscriptionPayment: {
    subscription: {
      startDate: Date;
      endDate: Date | null;
    } | null;
    pricingPlan:
      | (SubscriptionPricingPlan & {
          price: {
            period: number;
            periodType: PeriodType;
          };
        })
      | null;
  } | null;
}

export interface PaymentsViewModel {
  count: number;
  payments: Payment[];
}

export interface Payment {
  id: string;
  price: number;
  provider: PaymentProvider;
  period: number;
  periodType: PeriodType;
  paymentDate: string;
  endDate: string | null;
}
