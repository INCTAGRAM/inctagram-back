import { Injectable } from '@nestjs/common';
import { Ratio } from '@prisma/client';
import sharp, { Metadata } from 'sharp';

import { Dimensions, ImageService } from './image.service';

@Injectable()
export class SharpService extends ImageService {
  public async getMetadata(buffer: Buffer): Promise<Partial<Metadata>> {
    return sharp(buffer).metadata();
  }

  public async resize(
    file: Express.Multer.File,
    dimensions: Dimensions,
  ): Promise<Express.Multer.File> {
    const { width, height } = dimensions;

    const resizedBuffer = await sharp(file.buffer)
      .resize({
        width,
        height,
        fit: 'inside',
      })
      .toBuffer();

    return { ...file, buffer: resizedBuffer };
  }

  public async changeRatio(
    file: Express.Multer.File,
    ratio: Omit<Ratio, 'ORIGINAL'>,
  ): Promise<Express.Multer.File> {
    const { width, height } = await this.getMetadata(file.buffer);

    const resizeOpts: Partial<Dimensions> = { width, height };

    if (ratio === Ratio.LANDSCAPE) {
      resizeOpts.height = (width! * 9) / 16;
    }

    if (ratio === Ratio.SQUARE) {
      width! / height! < 1
        ? (resizeOpts.width = height)
        : (resizeOpts.height = width);
    }

    if (ratio === Ratio.PORTRAIT) {
      resizeOpts.width = (height! * 4) / 5;
    }

    const resizedBuffer = await sharp(file.buffer)
      .resize(resizeOpts)
      .toBuffer();

    return { ...file, buffer: resizedBuffer };
  }
}
