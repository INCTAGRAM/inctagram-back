import { InternalServerErrorException } from '@nestjs/common';

export class PaymentException extends InternalServerErrorException {
  public constructor() {
    super('Payment can not be proceeded');
  }
}
