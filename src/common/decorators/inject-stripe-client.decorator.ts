import { Inject } from '@nestjs/common';
import { STRIPE_TOKEN } from 'src/payment-system/constants';

export const InjectStripeClient = () => Inject(STRIPE_TOKEN);
