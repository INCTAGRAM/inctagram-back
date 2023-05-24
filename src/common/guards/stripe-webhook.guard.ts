import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { InjectStripe } from '../decorators/inject-stripe.decorator';

@Injectable()
export class StripeWebhookGuard implements CanActivate {
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const signature = request.headers['stripe-signature'];

      const endpointSecret = <string>(
        this.configService.get<string>('stripe.webhookSecret')
      );

      this.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        endpointSecret,
      );

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}
