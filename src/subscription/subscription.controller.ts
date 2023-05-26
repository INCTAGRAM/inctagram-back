import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CheckoutDto } from './dto/checkout.dto';
import { PaymentsMapper } from './utils/payments.mapper';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { JwtAtGuard } from 'src/common/guards/jwt-auth.guard';
import {
  CancelSubscriptionApiDecorator,
  CheckoutSessionApiDecorator,
  PriceListApiDecorator,
  SubscriptionsPaymentsApiDecorator,
} from 'src/common/decorators/swagger/subscriptions.decorator';
import type { StripeEvent } from './interfaces/events.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { CreatePaymentCommand } from './use-cases/create-payment.use-case';
import { StripeWebhookGuard } from 'src/common/guards/stripe-webhook.guard';
import { ProcessPaymentCommand } from './use-cases/process-payment.user-case';
import { CancelSubscriptionCommand } from './use-cases/cancel-subscription.use-case';
import { SubscriptionsQueryRepository } from './repositories/subscriptions.query-repository';

@ApiTags('Subscriptions')
@Controller('api/subscriptions')
export class SubscriptionController {
  public constructor(
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('price-list')
  @PriceListApiDecorator()
  public async prices() {
    return this.subscriptionsQueryRepository.getPriceList();
  }

  @Post('checkout-session')
  @CheckoutSessionApiDecorator()
  @UseGuards(JwtAtGuard)
  @HttpCode(HttpStatus.OK)
  public async createCheckoutSession(
    @ActiveUser('userId') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ) {
    const { priceId, paymentSystem } = checkoutDto;

    const url = await this.commandBus.execute<
      CreatePaymentCommand,
      string | null
    >(new CreatePaymentCommand(paymentSystem, priceId, userId));

    return url;
  }

  @ApiExcludeEndpoint()
  @Post('stripe-webhook')
  @UseGuards(StripeWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() event: StripeEvent<any>) {
    console.log(event);
    this.commandBus.execute(new ProcessPaymentCommand(event));
  }

  @Get('payments')
  @SubscriptionsPaymentsApiDecorator()
  @UseGuards(JwtAtGuard)
  public async getPayments(
    @ActiveUser('userId') userId: string,
    @Query() query: PaymentsQueryDto,
  ) {
    const result = await this.subscriptionsQueryRepository.getPaymentsByQuery(
      userId,
      query,
    );

    return PaymentsMapper.toViewModel(result);
  }

  @Post('cancel')
  @UseGuards(JwtAtGuard)
  @CancelSubscriptionApiDecorator()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async cancelSubscription(@ActiveUser('userId') userId: string) {
    await this.commandBus.execute(new CancelSubscriptionCommand(userId));
  }

  @Get('current')
  @UseGuards(JwtAtGuard)
  public async getCurrentSubscription(@ActiveUser('userId') userId: string) {}
}
