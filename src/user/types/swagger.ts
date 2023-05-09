import { ApiProperty, PickType } from '@nestjs/swagger';

import { CreatePostResult, UserPosts } from '.';

export class CreatePostResponse implements CreatePostResult {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public userId: string;

  @ApiProperty({ type: () => [CreatePostResponseImage] })
  public images: CreatePostResponseImage[];

  @ApiProperty({ type: () => Date })
  public createdAt: Date;

  @ApiProperty({ type: () => Date })
  public updatedAt: Date;
}

export class GetUserPostsResponse implements UserPosts {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public description: string;

  @ApiProperty({ type: () => [GetUserPostsResponstImage] })
  public images: GetUserPostsResponstImage[];

  @ApiProperty({ type: () => Date })
  public createdAt: Date;

  @ApiProperty({ type: () => Date })
  public updatedAt: Date;
}

class CreatePostResponseMetadata {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public size: number;

  @ApiProperty()
  public width: number;

  @ApiProperty()
  public height: number;

  @ApiProperty()
  public imageId: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;
}

class GetUserPostsResponseMetadata extends PickType(
  CreatePostResponseMetadata,
  ['width', 'height'] as const,
) {}

class CreatePostResponseImage {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public url: string;

  @ApiProperty()
  public previewUrl: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  @ApiProperty()
  public postId: string;

  @ApiProperty()
  public metadata: CreatePostResponseMetadata;
}

class GetUserPostsResponstImage extends PickType(CreatePostResponseImage, [
  'url',
  'previewUrl',
] as const) {
  @ApiProperty()
  public metadata: GetUserPostsResponseMetadata;
}
