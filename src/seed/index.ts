import { PeriodType, PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.subscriptionPrice.deleteMany({});

  const firstPlanType = {
    period: 1,
    periodType: PeriodType.MONTH,
    value: 10.0,
    currency: 'USD',
  } as const;

  const secondPlanType = {
    period: 6,
    value: 50.0,
    periodType: PeriodType.MONTH,
    currency: 'USD',
  } as const;

  const thirdPlanType = {
    period: 1,
    periodType: PeriodType.YEAR,
    value: 100.0,
    currency: 'USD',
  } as const;

  const fourthPlanType = {
    period: 1,
    periodType: PeriodType.DAY,
    value: 1,
    currency: 'USD',
  } as const;

  const planTypes = [
    firstPlanType,
    secondPlanType,
    thirdPlanType,
    fourthPlanType,
  ] as const;

  await prisma.subscriptionPrice.createMany({
    data: [planTypes[0], planTypes[1], planTypes[2], planTypes[3]],
  });

  const prices = await prisma.subscriptionPrice.findMany({});

  const priceIds: string[] = Array(4);

  prices.forEach((price) => {
    planTypes.forEach((plan, idx) => {
      const isEqual = Object.keys(plan).every((key) => {
        return (
          plan[key as keyof typeof plan] === price[key as keyof typeof price]
        );
      });

      isEqual && (priceIds[idx] = price.id);
    });
  });

  await prisma.subscriptionPricingPlan.createMany({
    data: [
      {
        priceId: priceIds[0],
        provider: 'STRIPE',
        subscriptionType: 'RECCURING',
        providerPriceId: 'price_1N5xcwCiLuvOXDcQZa55KgSs',
      },
      {
        priceId: priceIds[1],
        provider: 'STRIPE',
        subscriptionType: 'RECCURING',
        providerPriceId: 'price_1N5xcwCiLuvOXDcQFKwj2Oq6',
      },
      {
        priceId: priceIds[2],
        provider: 'STRIPE',
        subscriptionType: 'RECCURING',
        providerPriceId: 'price_1N5xcwCiLuvOXDcQ9Zyf5Snl',
      },
      {
        priceId: priceIds[3],
        provider: 'STRIPE',
        subscriptionType: 'RECCURING',
        providerPriceId: 'price_1NBkGFCiLuvOXDcQo37IZ6Vq',
      },
      // PAYPAL
      {
        priceId: priceIds[0],
        provider: 'PAYPAL',
        subscriptionType: 'RECCURING',
        providerPriceId: 'P-94S73988AG6344329MRPVXEI',
      },
      {
        priceId: priceIds[1],
        provider: 'PAYPAL',
        subscriptionType: 'RECCURING',
        providerPriceId: 'P-9PK61989CS7583206MRPV6IQ',
      },
      {
        priceId: priceIds[2],
        provider: 'PAYPAL',
        subscriptionType: 'RECCURING',
        providerPriceId: 'P-78740027FH535145YMRPWJBY',
      },
    ],
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => console.log('seeding completed'));
