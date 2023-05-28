import { registerAs } from '@nestjs/config';

export const subscriptionsConfig = registerAs('subscriptions', () => {
  const frontendDomain =
    process.env.MODE === 'production'
      ? process.env.FRONTEND_LOCAL_DOMAIN
      : process.env.FRONTEND_LOCAL_DOMAIN;
  // ? process.env.FRONTEND_DOMAIN
  return {
    successUrl: `${frontendDomain}/payments/?success=true`,
    cancelUrl: `${frontendDomain}/payments/?cancel=true`,
  };
});
