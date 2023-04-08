import sharp from 'sharp';
import { FileValidator, Injectable } from '@nestjs/common';

type ValidationOptions = {
  minWidth: number;
  minHeight: number;
};

@Injectable()
export class ImageDimensionsValidatonPipe extends FileValidator<ValidationOptions> {
  public constructor(options: ValidationOptions) {
    super(options);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file) return false;

    const { height = 0, width = 0 } = await sharp(file.buffer).metadata();

    return !(
      height < this.validationOptions.minHeight ||
      width < this.validationOptions.minWidth
    );
  }

  buildErrorMessage(): string {
    return 'Bad dimensions';
  }
}
