import type { PaymentProvider } from '@prisma/client';

export interface Payments {
  id: string;
  price: number;
  provider: PaymentProvider;
  subscriptionPayment: {
    period: number;
    subscription: {
      startDate: Date;
      endDate: Date;
    } | null;
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
  paymentDate: string;
  endDate: string;
}
