import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ProfileQueryRepositoryAdapter {
  abstract findByUserId(userId: string): Promise<any | null>;
}
