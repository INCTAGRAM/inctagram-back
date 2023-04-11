import { Injectable } from '@nestjs/common';
import { PrismaClient, Profile } from '@prisma/client';
import { ProfilesQueryRepositoryAdapter } from './adapters/profiles-query-repository.adapter';

@Injectable()
export class ProfileQueryRepository extends ProfilesQueryRepositoryAdapter<Profile> {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async findUserProfileById(userId: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userId } });
  }
}
