import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { Oauth20UserData } from '../../user/types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleAuthAdaptor {
  constructor(
    private userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(userInfo: Oauth20UserData) {
    console.log(userInfo);

    const user = await this.userRepository.findUserByEmail(userInfo.email);
    if (user) return user;

    const checkUserName = await this.userRepository.findUserByUserName(
      userInfo.displayName,
    );

    if (checkUserName) {
      const temporaryUsername = userInfo.displayName.concat();
      // const checkUserName = await this.userRepository.findUserByUserName(
      //     temporaryUsername
      // );
    }
    //
    // const newUser = await this.prisma.user.create({
    //   data: {
    //     u,
    //   },
    // });
  }
}
