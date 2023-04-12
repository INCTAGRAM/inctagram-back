import { Injectable } from '@nestjs/common';

import { PrismaClient, Profile } from '@prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async createUserProfile() {}
}
