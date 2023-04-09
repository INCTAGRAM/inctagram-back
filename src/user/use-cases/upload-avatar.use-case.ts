import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Avatar, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

import {
  AVATAR_PREVIEW_HEIGHT,
  AVATAR_PREVIEW_WIDTH,
} from 'src/common/constants';
import { ImageService } from 'src/common/services/image.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { FILE_DELITION_ERROR, FILE_UPLOAD_ERROR } from 'src/common/errors';
import { ImagesQueryRepositoryAdapter } from '../repositories/adapters/images-query-repository.adapter';

export class UploadAvatarCommand {
  public constructor(public userId: string, public file: Express.Multer.File) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase implements ICommandHandler {
  public constructor(
    private readonly avatarsQueryRepository: ImagesQueryRepositoryAdapter<Avatar>,
    private readonly yandexCloudService: CloudStrategy,
    private readonly prismaClient: PrismaClient,
    private readonly imageService: ImageService,
  ) {}

  public async execute(command: UploadAvatarCommand): Promise<Avatar> {
    const { userId, file: avatar } = command;

    const existingAvatar = await this.avatarsQueryRepository.findByUserId(
      userId,
    );

    if (existingAvatar) {
      const { url, previewUrl } = existingAvatar;

      if (url && previewUrl) {
        try {
          await this.prismaClient.$transaction(
            async <T extends Partial<PrismaClient>>(prisma: T) => {
              await Promise.all([
                prisma.avatar?.update({
                  where: {
                    userId,
                  },
                  data: {
                    url: null,
                    previewUrl: null,
                    size: null,
                    height: null,
                    width: null,
                  },
                }),
                this.yandexCloudService.remove([url, previewUrl]),
              ]);
            },
          );
        } catch (error) {
          console.log(error);

          throw new InternalServerErrorException(FILE_DELITION_ERROR);
        }
      }
    }

    const { size, width, height } = await this.imageService.getMetadata(
      avatar.buffer,
    );

    const ext = avatar.originalname.split('.')[1];
    const avatarName = `${randomUUID()}.${ext}`;
    const avatarPath = `${this.createPrefix(userId)}${avatarName}`;

    const preview = await this.imageService.resize(avatar, {
      width: AVATAR_PREVIEW_WIDTH,
      height: AVATAR_PREVIEW_HEIGHT,
    });

    const previewName = `${randomUUID()}.${ext}`;
    const previewPath = `${this.createPrefix(userId)}.preivew.${previewName}`;

    try {
      const uploadedAvatar = <Avatar>await this.prismaClient.$transaction(
        async <T extends Partial<PrismaClient>>(prisma: T) => {
          const [url, previewUrl] = await Promise.all([
            this.yandexCloudService.upload(avatarPath, avatar),
            this.yandexCloudService.upload(previewPath, preview),
          ]);

          return prisma.avatar?.update({
            where: {
              userId,
            },
            data: {
              url,
              previewUrl,
              size,
              height,
              width,
            },
          });
        },
      );

      return uploadedAvatar;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(FILE_UPLOAD_ERROR);
    }
  }

  private createPrefix(userId: string) {
    return `content/users/${userId}/avatar/`;
  }
}
