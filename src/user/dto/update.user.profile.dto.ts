import { IsDate, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto {
  @Length(6, 30)
  @IsString()
  username: string;
  @Length(1, 40)
  @IsString()
  name: string;
  @Length(1, 40)
  @IsString()
  surname: string;
  @IsDate()
  @IsOptional()
  birthday: Date | null;
  @Length(1, 60)
  @IsString()
  city: string;
  @Length(1, 200)
  @IsString()
  @IsOptional()
  aboutMe: string | null;
}
