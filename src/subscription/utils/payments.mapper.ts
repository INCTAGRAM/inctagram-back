import { Payments, PaymentsViewModel } from '../interfaces';

export class PaymentsMapper {
  public static toViewModel(model: [number, Payments[]]): PaymentsViewModel {
    const [count, payments] = model;

    return {
      count,
      payments: payments.map((payment) => {
        return {
          id: payment.id,
          price: payment.price,
          provider: payment.provider,
          period: payment.subscriptionPayment!.period,
          paymentDate:
            payment.subscriptionPayment!.subscription!.startDate.toISOString(),
          endDate:
            payment.subscriptionPayment!.subscription!.endDate.toISOString(),
        };
      }),
    };
  }
}
