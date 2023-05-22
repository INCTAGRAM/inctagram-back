import { Inject } from '@nestjs/common';
import { PAYPAL_TOKEN } from 'src/payment-system/constants';

export const InjectPaypal = () => Inject(PAYPAL_TOKEN);
