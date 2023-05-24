import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class QueryDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value) || 1)
  public page: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value) || 9)
  public pageSize: number;
}
