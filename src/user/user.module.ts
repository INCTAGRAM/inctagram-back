import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UsersController } from './api/users.controller';
import { UserRepository } from './repositories/user.repository';
import { ImageService } from 'src/common/services/image.service';
import { SharpService } from 'src/common/services/sharp.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { AvatarsRepository } from './repositories/avatars.repository';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { AvatarsQueryRepository } from './repositories/avatars.query-repository';
import { YandexCloudStrategy } from 'src/common/strategies/yandex-cloud.strategy';
import { ImagesRepositoryAdapter } from './repositories/adapters/images-repository.adapter';
import { ImagesQueryRepositoryAdapter } from './repositories/adapters/images-query-repository.adapter';
import { ProfileQueryRepository } from './repositories/profile.query-repository';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { ProfileRepository } from './repositories/profile.repository';

const useCases = [UploadAvatarUseCase, CreateProfileUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    UserRepository,
    ProfileQueryRepository,
    ProfileRepository,
    PrismaClient,
    ...useCases,
    {
      provide: CloudStrategy,
      useClass: YandexCloudStrategy,
    },
    {
      provide: ImagesQueryRepositoryAdapter,
      useClass: AvatarsQueryRepository,
    },
    {
      provide: ImagesRepositoryAdapter,
      useClass: AvatarsRepository,
    },
    {
      provide: ImageService,
      useClass: SharpService,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
