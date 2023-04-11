import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ProfilesQueryRepositoryAdapter<T> {
  abstract findUserProfileById(userId: string): Promise<T | null>;
}
