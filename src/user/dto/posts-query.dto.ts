import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { ValidateIfOtherNotExists } from 'src/common/decorators/validate-if-other-not-exists.decorator';

export class PostsQueryDto {
  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value);

    return parsedValue > 0 ? parsedValue : 1;
  })
  @ValidateIfOtherNotExists('id')
  @IsOptional()
  public page: number;

  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value);

    return parsedValue > 0 ? parsedValue : 9;
  })
  public pageSize: number;

  @IsUUID()
  @IsOptional()
  public id: string;
}
