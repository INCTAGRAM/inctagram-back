import { RepositoryAdapter } from 'src/common/adapters/repository.adapter';

export abstract class PostsRepositoryAdapter<T> extends RepositoryAdapter {
  public abstract deletePost(userId: string, postId: string): Promise<void>;
}
