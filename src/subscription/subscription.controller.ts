import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CheckoutDto } from './dto/checkout.dto';
import { JwtAtGuard } from 'src/common/guards/jwt-auth.guard';
import type { StripeEvent } from './interfaces/stripe-events.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { CreatePaymentCommand } from './use-cases/create-payment.use-case';
import { StripeWebhookGuard } from 'src/common/guards/stripe-webhook.guard';
import { SubscriptionsQueryRepository } from './repositories/subscriptions.query-repository';

@Controller('api/subscriptions')
export class SubscriptionController {
  public constructor(
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('price-list')
  public async prices() {
    return this.subscriptionsQueryRepository.getPriceList();
  }

  @Post('checkout-session')
  @UseGuards(JwtAtGuard)
  public async createCheckoutSession(
    @ActiveUser('userId') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ) {
    const { priceId, paymentSystem, renew = false } = checkoutDto;

    const url = await this.commandBus.execute<
      CreatePaymentCommand,
      string | null
    >(new CreatePaymentCommand(paymentSystem, priceId, userId, renew));

    return url;
  }

  @Post('stripe-webhook')
  @UseGuards(StripeWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() event: StripeEvent<any>) {}
}
