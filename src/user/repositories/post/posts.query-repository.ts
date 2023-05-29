import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DATABASE_ERROR } from 'src/common/errors';

import { PrismaService } from 'src/prisma/prisma.service';
import { PostsQueryDto } from 'src/user/dto/posts-query.dto';
import { UserPost, UserPosts } from 'src/user/types';
import { PostsQueryRepositoryAdatapter } from '../adapters/post/posts.query-adapter';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PostsQueryRepository extends PostsQueryRepositoryAdatapter {
  public constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private postSelectData = {
    id: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    images: {
      select: {
        metadata: {
          select: {
            height: true,
            width: true,
          },
        },
        url: true,
        previewUrl: true,
      },
    },
  };

  public async getPostsByQuery(
    userId: string,
    postsQuery: PostsQueryDto,
  ): Promise<[number, UserPosts[]]> {
    const { page, pageSize, id } = postsQuery;

    try {
      const count = await this.prismaService.post.count({
        where: {
          userId,
        },
      });

      const clause = {
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: pageSize,
        skip: id ? 1 : (page - 1) * pageSize,
        select: {
          id: true,
          createdAt: true,
          images: {
            select: {
              previewUrl: true,
            },
          },
        },
      } as const;

      if (id) {
        (<Prisma.PostFindManyArgs>clause).cursor = { id };
      }

      const posts = await this.prismaService.post.findMany(clause);

      return [count, posts];
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(DATABASE_ERROR);
    }
  }

  public async getPostById(
    userId: string,
    postId: string,
  ): Promise<UserPost | null> {
    try {
      return this.prismaService.post.findFirst({
        where: {
          userId,
          id: postId,
        },
        select: this.postSelectData,
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(DATABASE_ERROR);
    }
  }
}
