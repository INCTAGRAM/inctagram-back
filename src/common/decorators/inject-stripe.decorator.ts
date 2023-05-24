import { Inject } from '@nestjs/common';
import { STRIPE_TOKEN } from 'src/payment-system/constants';

export const InjectStripe = () => Inject(STRIPE_TOKEN);
