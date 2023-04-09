import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UsersController } from './api/users.controller';
import { UserRepository } from './repositories/user.repository';
import { ImageService } from 'src/common/services/image.service';
import { SharpService } from 'src/common/services/sharp.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { AvatarsQueryRepository } from './repositories/avatars.query-repository';
import { YandexCloudStrategy } from 'src/common/strategies/yandex-cloud.strategy';
import { ImagesQueryRepositoryAdapter } from './repositories/adapters/images-query-repository.adapter';

const useCases = [UploadAvatarUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    UserRepository,
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
      provide: ImageService,
      useClass: SharpService,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
