import { ApiProperty } from '@nestjs/swagger';

import { CreatePostResult } from '.';

export class CreatePostResponse implements CreatePostResult {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public userId: string;

  @ApiProperty({ type: () => [Image] })
  public images: Image[];
}

class Metadata {
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

class Image {
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
  public metadata: Metadata;
}
