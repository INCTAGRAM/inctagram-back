import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { ProfileDbModel } from '../types';
import { ProfileQueryRepositoryAdapter } from './adapters/profile-query-repository.adapter';

@Injectable()
export class ProfileQueryRepository extends ProfileQueryRepositoryAdapter {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async findProfileAndAvatarByQuery(
    payload: Partial<Pick<User, 'id' | 'username' | 'email'>>,
  ): Promise<ProfileDbModel | null> {
    const result = await this.prisma.user.findUnique({
      where: payload,
      select: {
        username: true,
        profile: {
          select: {
            birthday: true,
            aboutMe: true,
            name: true,
            surname: true,
            city: true,
          },
        },
        avatar: {
          select: {
            url: true,
            previewUrl: true,
          },
        },
      },
    });

    if (!result?.profile) return null;

    return result;
  }
}
