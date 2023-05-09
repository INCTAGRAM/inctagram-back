import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DATABASE_ERROR } from 'src/common/errors';

import { PrismaService } from 'src/prisma/prisma.service';
import { PostsQueryDto } from 'src/user/dto/posts-query.dto';
import { PostsQueryRepositoryAdatapter } from '../adapters/post/posts.query-adapter';

@Injectable()
export class PostsQueryRepository extends PostsQueryRepositoryAdatapter {
  public constructor(private readonly prismaService: PrismaService) {
    super();
  }

  public async getPostsByQuery(userId: string, postsQuery: PostsQueryDto) {
    const { page, pageSize } = postsQuery;

    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
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
        },
      });

      return posts;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException({ cause: DATABASE_ERROR });
    }
  }
}
