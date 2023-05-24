import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PostsQueryDto {
  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value);

    return parsedValue > 0 ? parsedValue : 1;
  })
  public page: number;

  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value);

    return parsedValue > 0 ? parsedValue : 9;
  })
  public pageSize: number;
}
