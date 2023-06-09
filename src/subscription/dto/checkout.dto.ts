import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CheckoutDto {
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  public paymentSystem: PaymentProvider;

  @IsString()
  @IsNotEmpty()
  public priceId: string;
}
