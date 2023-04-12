import { IsDate, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto {
  @Length(6, 30)
  @IsString()
  @IsOptional()
  username: string | null;
  @Length(1, 40)
  @IsString()
  @IsOptional()
  name: string | null;
  @Length(1, 40)
  @IsString()
  @IsOptional()
  surname: string | null;
  @IsDate()
  @IsOptional()
  birthday: Date | null;
  @Length(1, 60)
  @IsString()
  @IsOptional()
  city: string | null;
  @Length(1, 200)
  @IsString()
  @IsOptional()
  aboutMe: string | null;
}
