import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { Oauth20UserData } from '../../user/types';

import { uid } from 'uid';
@Injectable()
export class GoogleAuthAdaptor {
  constructor(private userRepository: UserRepository) {}

  async validateUser(userInfo: Oauth20UserData) {
    console.log(userInfo);

    const user = await this.userRepository.findUserByEmail(userInfo.email);

    // if (user?.hash && !user.oauthClientId) {
    // send mail
    //   console.log('You have been registered');
    // }
    if (user) return user;

    const checkUsername = await this.validateUserName(userInfo.displayName);

    // create user and manually confirm email
    // return this.userRepository.createOauthUser({
    //   ...userInfo,
    //   displayName: checkUsername,
    // });
  }
  async validateUserName(username: string): Promise<string> {
    const checkUsername = await this.userRepository.findUserByUserName(
      username,
    );
    if (checkUsername) {
      const temporaryUsername = username.concat(uid(5));
      return this.validateUserName(temporaryUsername);
    }
    return username;
  }
}
