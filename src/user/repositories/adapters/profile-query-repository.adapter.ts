import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ProfileQueryRepositoryAdapter<T> {
  abstract findUserProfileById(userId: string): Promise<T | null>;
}
