import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Payment, PaymentStatus, SubscriptionStatus } from '@prisma/client';

import { Payments } from '../interfaces';
import { DATABASE_ERROR } from 'src/common/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentsQueryDto } from '../dto/payments-query.dto';
import { DatabaseException } from 'src/common/exceptions/database.exception';

@Injectable()
export class SubscriptionsQueryRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async getSubscriptionPriceById(id: string) {
    try {
      return this.prismaService.subscriptionPrice.findUnique({
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
      return this.prismaService.payment.findFirst({
        where: {
          ...query,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }

  public async getPriceList() {
    try {
      return this.prismaService.subscriptionPrice.findMany({
        select: {
          id: true,
          currency: true,
          period: true,
          value: true,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }

  public async getPaymentsByQuery(
    userId: string,
    query: PaymentsQueryDto,
  ): Promise<[number, Payments[]]> {
    const { page, pageSize } = query;

    try {
      const count = await this.prismaService.payment.count({
        where: {
          userId,
          status: PaymentStatus.CONFIRMED,
        },
      });

      const payments = await this.prismaService.payment.findMany({
        where: {
          userId,
          status: PaymentStatus.CONFIRMED,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          price: true,
          provider: true,
          subscriptionPayment: {
            select: {
              period: true,
              subscription: {
                select: {
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      return [count, payments];
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(DATABASE_ERROR);
    }
  }

  public async getProvidersSubscriptionId(userId: string) {
    try {
      const subscription = await this.prismaService.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      const providerSubscriptionId =
        await this.prismaService.subscriptionPayment.findUnique({
          where: {
            id: subscription?.subscriptionPaymentId,
          },
        });

      return providerSubscriptionId?.providerSubscriptionId || null;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(DATABASE_ERROR);
    }
  }
}
