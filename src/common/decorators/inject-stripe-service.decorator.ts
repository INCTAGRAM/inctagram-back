import { Inject } from '@nestjs/common';
import { STRIPE_PAYMENT_SERVICE } from '../constants';

export const InjectStripeService = () => Inject(STRIPE_PAYMENT_SERVICE);
