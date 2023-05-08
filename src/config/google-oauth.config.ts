import { registerAs } from '@nestjs/config';

export const googleOauthConfig = registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  tokenUrl: process.env.GOOGLE_TOKEN_URL,
  // userUrl: process.env.GITHUB_USER_URL,
  // userEmailsUrl: process.env.GITHUB_USER_EMAILS_URL,
}));
