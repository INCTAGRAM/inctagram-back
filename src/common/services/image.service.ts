import { Injectable } from '@nestjs/common';
import { Ratio } from '@prisma/client';
import { type Metadata } from 'sharp';

export interface Dimensions {
  width?: number;
  height?: number;
}

@Injectable()
export abstract class ImageService {
  public abstract getMetadata(
    buffer: Buffer,
  ): Promise<Pick<Metadata, 'size' | 'height' | 'width'>>;

  public abstract resize(
    file: Express.Multer.File,
    dimensions: Dimensions,
  ): Promise<Express.Multer.File>;

  public abstract changeRatio(
    file: Express.Multer.File,
    ratio: Ratio,
  ): Promise<Express.Multer.File>;
}
