import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PrismaClient, Profile, User } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ProfileRepositoryAdapter } from './adapters/profile-repository.adapter';
import { UpdateUserProfileDto } from '../dto/update.user.profile.dto';

@Injectable()
export class ProfileRepository extends ProfileRepositoryAdapter<Profile> {
  public constructor(private readonly prisma: PrismaClient) {
    super();
  }

  public async createProfile(
    userId: string,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<Profile> {
    try {
      return this.prisma.profile.create({
        data: {
          userId,
          ...createUserProfileDto,
        },
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }

  public async updateProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<void> {
    try {
      await this.prisma.profile.update({
        where: {
          userId,
        },
        data: updateUserProfileDto,
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    userId: string,
  ): Promise<User> {
    try {
      return this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: updateUserProfileDto.username,
          profile: {
            update: {
              name: updateUserProfileDto.name,
              surname: updateUserProfileDto.surname,
              birthday: updateUserProfileDto.birthday,
              city: updateUserProfileDto.city,
              aboutMe: updateUserProfileDto.aboutMe,
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
