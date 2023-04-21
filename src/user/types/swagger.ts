import { ApiProperty } from '@nestjs/swagger';
import { Ratio } from '@prisma/client';

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

class CropInfo {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public x: number;

  @ApiProperty()
  public y: number;

  @ApiProperty()
  public height: number;

  @ApiProperty()
  public width: number;

  @ApiProperty()
  public metadataId: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;
}

class Metadata {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public zoom: number;

  // @ApiProperty({ type: () => Ratio })
  @ApiProperty({ enum: Ratio })
  public ratio: Ratio;

  @ApiProperty()
  public filters: string[];

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

  @ApiProperty()
  public cropInfo: CropInfo;
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
