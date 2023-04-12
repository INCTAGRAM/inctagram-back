import { Injectable } from '@nestjs/common';

import { PrismaClient, Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { ProfileRepositoryAdapter } from './adapters/profile-repository.adapter';
import { UpdateUserProfileDto } from '../dto/update.user.profile.dto';

@Injectable()
export class ProfileRepository extends ProfileRepositoryAdapter<Profile> {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async createUserProfile(
    createUserProfileDto: CreateUserProfileDto,
    userId: string,
  ): Promise<Profile> {
    try {
      return this.prisma.profile.create({
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
      throw error;
    }
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    userId: string,
  ) {
    try {
      return this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: updateUserProfileDto.username
            ? updateUserProfileDto.username
            : {},
          profile: {
            update: {
              name: updateUserProfileDto.name ? updateUserProfileDto.name : {},
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
//
