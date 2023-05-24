import { registerAs } from '@nestjs/config';

export const subscriptionsConfig = registerAs('subscriptions', () => {
  // const frontendDomain =
  //   process.env.MODE === 'production'
  //     ? process.env.FRONTEND_DOMAIN
  //     :

  return {
    successUrl: `${process.env.FRONTEND_LOCAL_DOMAIN}/?success=true`,
    cancelUrl: `${process.env.FRONTEND_LOCAL_DOMAIN}/?cancel=true`,
  };
});
