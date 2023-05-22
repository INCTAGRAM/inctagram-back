import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseException } from 'src/common/exceptions/database.exception';

@Injectable()
export class SubscriptionsQueryRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async getSubscriptionPriceById(id: string) {
    try {
      return this.prisma.subscriptionPrice.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }

  public async getPaymentByQuery(
    query: Partial<Pick<Payment, 'id' | 'userId' | 'status'>>,
  ) {
    try {
      return this.prisma.payment.findFirst({
        where: {
          ...query,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }
}
