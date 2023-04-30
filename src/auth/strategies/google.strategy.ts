import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleAuthAdaptor } from '../../adaptors/google/google-auth.adaptor';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly googleAuthAdaptor: GoogleAuthAdaptor,
  ) {
    super({
      clientID: config.get<string>('OATH_CLIENT_ID'),
      clientSecret: config.get<string>('OATH_CLIENT_SECRET'),
      callbackURL: 'http://localhost:5000/api/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    if (!profile.emails) throw new ForbiddenException('Email is absent');

    const { name, emails, displayName } = profile;
    const user = {
      oauthClientId: profile.id,
      email: emails[0].value,
      firstName: name ? name.givenName : '',
      lastName: name ? name.familyName : '',
      displayName: displayName ? displayName : '',
    };
    done(null, user);
  }
}
