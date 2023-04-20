import { Post, Prisma } from '@prisma/client';
import { DatabaseError } from 'src/common/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsRepositoryAdapter } from '../adapters/post/posts-repository.adapter';

export class PostsRepository extends PostsRepositoryAdapter<Post> {
  public constructor(private readonly prismaService: PrismaService) {
    super();
  }

  public async deletePost(userId: string, postId: string): Promise<void> {
    try {
      await this.prismaService.post.deleteMany({
        where: {
          userId,
          id: postId,
        },
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseError((<Error>error).message);
    }
  }

  public async deleteAll(): Promise<Prisma.BatchPayload> {
    try {
      const result = await this.prismaService.post.deleteMany();

      return result;
    } catch (error) {
      console.log(error);

      throw new DatabaseError((<Error>error).message);
    }
  }
}
