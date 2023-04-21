import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  public description: string;
}
