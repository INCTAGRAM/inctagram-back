import { Currency, PaymentProvider } from '@prisma/client';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';

import { Payment } from 'src/subscription/interfaces';
import { CheckoutDto } from 'src/subscription/dto/checkout.dto';

export function PriceListApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get list of subscriptions prices',
    }),
    ApiOkResponse({
      type: GetPriceListResponse,
    }),
    ApiInternalServerErrorResponse({
      description:
        'An error occurs when attempting to get prices from database',
    }),
  );
}

export function CheckoutSessionApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create checkout session',
    }),
    ApiBody({
      type: CreateCheckoutSessionResponse,
    }),
    ApiOkResponse({
      schema: {
        type: 'string',
        format: 'url',
        example:
          'https://checkout.stripe.com/c/pay/cs_test_a1W2qbeRlrwaosf55VeiFoCzPFQ3zCGNYylg90oLZ3BHrNWaM3YGoxAENk#fidkdWxOYHwnPyd1blpxYHZxWjA0SzFQT2xGbElwc0pdQWZUVGtrT39kMURTUEZAZ2QxMn1sbkNfaUo0YDxDT3JSVFc9VGZSNDxjS1R9aFJIZ0BSV05UQmNdanVXS0pNMUBiQnB%2FUlVIczN2NTVGUmlLbE5hMScpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',
      },
    }),
    ApiInternalServerErrorResponse({
      description:
        'An error occurs when attempting to get prices from database',
    }),
    ApiBearerAuth(),
  );
}

export function SubscriptionsPaymentsApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve payments',
    }),
    ApiOkResponse({
      type: SubscriptionsPaymentsResponse,
    }),
    ApiInternalServerErrorResponse({
      description:
        'An error occurs when attempting to get payments from database',
    }),
    ApiBearerAuth(),
  );
}

export function CancelSubscriptionApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel current subscription',
    }),
    ApiNoContentResponse({
      description: 'Subscription was successfully cancelled',
    }),
    ApiBadRequestResponse({
      description: 'Bad request to Stripe server',
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to get data from database',
    }),
    ApiBearerAuth(),
  );
}

class SubscriptionsPaymentsResponse {
  @ApiProperty()
  count: number;

  @ApiProperty({
    type: () => [PaymentsResponseType],
  })
  payments: Payment[];
}

class PaymentsResponseType implements Payment {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public price: number;

  @ApiProperty({
    enum: Object.keys(PaymentProvider),
    description: 'Payment type',
  })
  public provider: PaymentProvider;

  @ApiProperty()
  public endDate: string;

  @ApiProperty()
  public paymentDate: string;

  @ApiProperty({ description: 'Subscription type' })
  public period: number;
}

class GetPriceListResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty({ enum: Object.keys(Currency) })
  public currency: Currency;

  @ApiProperty({ description: 'Period of subscription in months' })
  public period: number;

  @ApiProperty({ description: 'Actual price value in currency' })
  public value: number;
}

class CreateCheckoutSessionResponse implements CheckoutDto {
  @ApiProperty()
  public priceId: string;

  @ApiProperty({ required: false })
  public renew: boolean;

  @ApiProperty({ enum: Object.keys(PaymentProvider) })
  public paymentSystem: PaymentProvider;
}
