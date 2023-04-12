import { Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from '../../dto/create.user.profile.dto';

@Injectable()
export abstract class ProfileRepositoryAdapter<T, E> {
  abstract createUserProfile(
    createUserProfileDto: CreateUserProfileDto,
    userId: string,
  ): Promise<T>;

  abstract updateUserProfile(
    createUserProfileDto: CreateUserProfileDto,
    userId: string,
  ): Promise<E>;
}
