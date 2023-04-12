import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async createUserProfile(
    createUserProfileDto: CreateUserProfileDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.prisma.profile.create({
        data: {
          name: createUserProfileDto.name,
          surname: createUserProfileDto.surname,
          birthday: createUserProfileDto.birthday,
          city: createUserProfileDto.city,
          aboutMe: createUserProfileDto.aboutMe,
          userId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
