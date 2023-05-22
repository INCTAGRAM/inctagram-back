import { PaymentProvider } from '@prisma/client';

export class PaymentCommand {
  public constructor(
    public readonly userId: string,
    public readonly priceId: string,
    public readonly renew: boolean,
  ) {}
}

export abstract class PaymentStrategy<T = string | null> {
  public abstract name: PaymentProvider;

  public abstract execute(command: PaymentCommand): Promise<T>;
}