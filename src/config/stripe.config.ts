import { registerAs } from '@nestjs/config';

export const stripeConfig = registerAs('stripe', () => ({
  apiKey: process.env.STRIPE_API_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}));
