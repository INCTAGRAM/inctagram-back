import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
  Subscription,
  SubscriptionPayment,
  SubscriptionPricingPlan,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';

import { Payments } from '../interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentsQueryDto } from '../dto/payments-query.dto';
import { DatabaseException } from 'src/common/exceptions/database.exception';
import { sub } from 'date-fns';

@Injectable()
export class SubscriptionsQueryRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async getSubscriptionPricingPlanByQuery(
    query: Partial<SubscriptionPricingPlan>,
  ) {
    try {
      return this.prismaService.subscriptionPricingPlan.findFirstOrThrow({
        where: query,
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseException();
    }
  }

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
      return this.prismaService.payment.findFirstOrThrow({
        where: query,
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }

  public async getPriceById(id: string) {
    try {
      return this.prismaService.subscriptionPrice.findUniqueOrThrow({
        where: {
          id,
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
          periodType: true,
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
            include: {
              subscription: {
                select: {
                  startDate: true,
                  endDate: true,
                },
              },
              pricingPlan: {
                include: {
                  price: {
                    select: {
                      period: true,
                      periodType: true,
                    },
                  },
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

      throw new DatabaseException();
    }
  }

  public async getUsersCurrentSubscription(userId: string) {
    try {
      return this.prismaService.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          endDate: true,
          startDate: true,
          subscriptionPayment: {
            select: {
              pricingPlan: {
                select: {
                  subscriptionType: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseException();
    }
  }

  public async getSubscriptionByQuery(query: Partial<Subscription>) {
    try {
      return this.prismaService.subscription.findFirst({
        where: query,
        include: {
          subscriptionPayment: {
            select: {
              id: true,
              paymentId: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseException();
    }
  }

  public async getSubscriptionPaymentByQuery(
    query: Partial<Pick<SubscriptionPayment, 'id' | 'paymentId'>>,
  ) {
    try {
      return this.prismaService.subscriptionPayment.findFirstOrThrow({
        where: query,
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseException();
    }
  }
}
