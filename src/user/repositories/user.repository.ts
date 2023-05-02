import { AccountsMergeInfo, Avatar, EmailConfirmation, User  } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create.user.dto';
import { CreateUserData, UserWithEmailConfirmation, Oauth20UserData } from '../types';


@Injectable()
export class UserRepository {
  public constructor(private prisma: PrismaService) {}

  public async createUser(createUserData: CreateUserData, hash: string | null) {
    const { username, email, isConfirmed, avatarPayload, oauthClientId } =
      createUserData;
    let avatar: Partial<Avatar> = {};

    if (avatarPayload) {
      const { url, previewUrl, size, height, width } = avatarPayload;
      avatar = { url, previewUrl, size, height, width };
    }

    return this.prisma.user.create({
      data: {
        username,
        email,
        hash,
        oauthClientId: oauthClientId || null,
        emailConfirmation: {
          create: {
            confirmationCode: randomUUID(),
            expirationDate: add(new Date(), {
              minutes: 1,
            }).toISOString(),
            isConfirmed: Boolean(isConfirmed),
          },
        },
        passwordRecovery: { create: {} },
        profile: { create: {} },
        accountsMergeInfo: { create: {} },
        avatar: { create: avatar },
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        oauthClientId: true,
        emailConfirmation: {
          select: {
            confirmationCode: true,
          },
        },
      },
    });
  }

  public async createOauthUser(userInfo: Oauth20UserData): Promise<User> {
    try {
      return this.prisma.user.create({
        data: {
          oauthClientId: userInfo.oauthClientId,
          username: userInfo.displayName,
          email: userInfo.email,
          emailConfirmation: {
            create: {
              confirmationCode: randomUUID(),
              expirationDate: add(new Date(), {
                minutes: 1,
              }).toISOString(),
              isConfirmed: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email },
      include: {
        emailConfirmation: {
          select: { isConfirmed: true },
        },
      },
    });
  }
  public async findUserByUserName(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        emailConfirmation: {
          select: { isConfirmed: true },
        },
      },
    });
  }

  public async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<UserWithEmailConfirmation | null> {
    return this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          confirmationCode: code,
        },
      },
      include: {
        emailConfirmation: {
          select: {
            confirmationCode: true,
            expirationDate: true,
            isConfirmed: true,
          },
        },
      },
    });
  }

  public async findUserByConfirmationOrRecoveryCode(code: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {
            emailConfirmation: {
              confirmationCode: code,
            },
          },
          {
            passwordRecovery: {
              recoveryCode: code,
            },
          },
        ],
      },
      include: {
        emailConfirmation: {
          select: {
            confirmationCode: true,
            expirationDate: true,
            isConfirmed: true,
          },
        },
        passwordRecovery: {
          select: {
            recoveryCode: true,
            expirationDate: true,
          },
        },
      },
    });
  }

  public async updateEmailConfirmationCode(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: { isConfirmed: true },
    });
  }

  public async updateEmailConfirmationInfo(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 10,
        }).toISOString(),
      },
    });
  }

  public async updatePasswordRecoveryCode(
    userId: string,
    recoveryCode: string,
  ) {
    return this.prisma.passwordRecovery.update({
      where: { userId },
      data: {
        recoveryCode,
        expirationDate: add(new Date(), {
          minutes: 10,
        }).toISOString(),
      },
    });
  }

  public async updatePassword(id: string, hash: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        hash,
        passwordRecovery: {
          update: {
            recoveryCode: null,
            expirationDate: null,
          },
        },
      },
    });
  }

  public async findUserById(
    id: string,
  ): Promise<UserWithEmailConfirmation | null> {
    try {
      return this.prisma.user.findFirst({
        where: {
          id,
        },
        include: {
          emailConfirmation: true,
        },
      });
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  public async deleteAll() {
    return this.prisma.user.deleteMany({});
  }

  public async updateAccountsMergeInfo(
    id: string,
    payload: Partial<
      Pick<AccountsMergeInfo, 'isMerged' | 'mergeCode' | 'expirationDate'>
    >,
  ) {
    try {
      return this.prisma.accountsMergeInfo.upsert({
        where: {
          userId: id,
        },
        update: payload,
        create: {
          userId: id,
          ...payload,
        },
      });
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  public async createUniqueUsername(username: string) {
    let uniqueUsername = username;
    let count = 1;

    while (await this.findUserByUserName(username)) {
      uniqueUsername = `${username}${count}`;
      count++;
    }

    return uniqueUsername;
  }
}
