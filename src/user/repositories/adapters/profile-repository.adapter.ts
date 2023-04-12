import { Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from '../../dto/create.user.profile.dto';

@Injectable()
export abstract class ProfileRepositoryAdapter<T> {
  abstract createUserProfile(
    createUserProfileDto: CreateUserProfileDto,
    userId: string,
  ): Promise<T>;
}
