import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { google, Auth } from 'googleapis';
import { googleOauthConfig } from '../../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GoogleAuthAdaptor {
  oauthClient: Auth.OAuth2Client;

  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOauthConfig>,
    private userRepository: UserRepository,
  ) {
    this.oauthClient = new google.auth.OAuth2(
      this.oauthConfig.clientId,
      this.oauthConfig.clientSecret,
      'postmessage',
    );
  }

  async validateUser(code: string) {
    const { tokens } = await this.oauthClient.getToken(code);

    if (!tokens || !tokens.access_token)
      throw new UnauthorizedException('code provided is not valid');

    const googleUserData = await this.getUserData(tokens.access_token);
    console.log(googleUserData);
    const { name, given_name, family_name, email, id } = googleUserData;

    if (!name || !email || !id)
      throw new UnauthorizedException('name, email or id are absent');

    return { name, given_name, family_name, email, id };
  }

  private async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });
    console.log(userInfoResponse);
    return userInfoResponse.data;
  }
}
