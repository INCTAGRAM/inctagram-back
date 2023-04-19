import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '@prisma/client';
import { randomUUID } from 'crypto';

import {
  AVATAR_PREVIEW_HEIGHT,
  AVATAR_PREVIEW_WIDTH,
} from 'src/common/constants';
import { Ratio } from '../dto/image-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ImageCreationData, ImageInfo } from '../types';
import { ImageService } from 'src/common/services/image.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { PostCreationError, POST_CREATION_ERROR } from 'src/common/errors';

export class CreatePostCommand {
  public constructor(
    public userId: string,
    public images: Express.Multer.File[],
    public imagesInfo: ImageInfo[],
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler {
  public constructor(
    private readonly cloudService: CloudStrategy,
    private readonly imageService: ImageService,
    private readonly prismaService: PrismaService,
  ) {}

  public async execute(command: CreatePostCommand): Promise<Post | null> {
    try {
      const { userId, images, imagesInfo } = command;

      const postId = randomUUID();

      const imagesWithPaths: [string, Express.Multer.File][] = [];
      const imagesMetadata: { size: number; width: number; height: number }[] =
        [];

      for (const [index, image] of Object.entries(images)) {
        const ratio = imagesInfo[Number(index)]?.ratio || Ratio.SQUARE;

        const transformedImage =
          ratio === Ratio.ORIGINAL
            ? image
            : await this.imageService.changeRatio(image, ratio);

        const {
          size = 0,
          width = 0,
          height = 0,
        } = await this.imageService.getMetadata(image.buffer);

        imagesMetadata.push({ size, width, height });

        const ext = image.originalname.split('.')[1];
        const imageName = `${randomUUID()}.${ext}`;
        const imagePath = `${this.createPrefix(userId, postId)}${imageName}`;

        const preview = await this.imageService.resize(transformedImage, {
          width: AVATAR_PREVIEW_WIDTH,
          height: AVATAR_PREVIEW_HEIGHT,
        });

        const previewName = `${randomUUID()}.${ext}`;
        const previewPath = `${this.createPrefix(
          userId,
          postId,
        )}.preivew.${previewName}`;

        imagesWithPaths.push([imagePath, transformedImage]);
        imagesWithPaths.push([previewPath, preview]);
      }

      return this.prismaService.$transaction(async (prisma) => {
        const imagesUrls = await Promise.all(
          imagesWithPaths.map(([path, file]) =>
            this.cloudService.upload(path, file),
          ),
        );

        const imageCreationData: ImageCreationData[] = images.map((_, idx) => {
          const { cropInfo, description, ...rest } = imagesInfo[idx] ?? {};

          return {
            metadata: {
              ...(rest ?? {}),
              ...(imagesMetadata[idx] ?? {}),
            },
            cropInfo: cropInfo ?? {},
            description: description ?? null,
            url: imagesUrls[idx * 2],
            previewUrl: imagesUrls[idx * 2 + 1],
          };
        });

        return prisma.post.create({
          data: {
            id: postId,
            userId,
            images: {
              create: [
                ...imageCreationData.map((info) => ({
                  url: info.url,
                  previewUrl: info.previewUrl,
                  description: info.description,
                  metadata: {
                    create: {
                      ...info.metadata,
                      cropInfo: {
                        create: {
                          ...info.cropInfo,
                        },
                      },
                    },
                  },
                })),
              ],
            },
          },
          include: {
            images: {
              include: {
                metadata: {
                  include: {
                    cropInfo: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.log(error);

      throw new PostCreationError(POST_CREATION_ERROR);
    }
  }

  private createPrefix(userId: string, postId: string) {
    return `content/users/${userId}/posts/${postId}/`;
  }
}
