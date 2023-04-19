import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum Ratio {
  ORIGINAL = 'ORIGINAL',
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
  SQUARE = 'SQUARE',
}

export class CropInfo {
  @Min(0)
  @IsNumber()
  @IsOptional()
  x: number;

  @Min(0)
  @IsNumber()
  @IsOptional()
  y: number;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  height: number;

  @IsPositive()
  @IsNumber()
  @IsOptional()
  width: number;
}

export class ImageInfoDto {
  @Min(0, { each: true })
  @Max(1, { each: true })
  @IsNumber({}, { each: true })
  @Transform(({ value }: { value: string[] }) => {
    try {
      return value.map((el) => parseInt(el, 10));
    } catch (e) {
      return false;
    }
  })
  @IsOptional()
  public zoom: number[];

  @IsEnum(Ratio, { each: true })
  @IsOptional()
  ratio: Ratio[];

  @ValidateNested()
  @Type(() => CropInfo)
  @Transform(({ value }: { value: string[] }) => {
    try {
      return value.map((el) => plainToInstance(CropInfo, JSON.parse(el)));
    } catch (e) {
      return false;
    }
  })
  @IsOptional()
  cropInfo: CropInfo[];

  // TODO IsArrayOfStringsValiator
  @IsArray({ each: true })
  @Transform(({ value }: { value: string[] }) => {
    try {
      return value.map((el) => JSON.parse(el));
    } catch (error) {
      return false;
    }
  })
  @IsOptional()
  filters: string[][];

  @IsString({ each: true })
  @IsOptional()
  description: string[];
}
