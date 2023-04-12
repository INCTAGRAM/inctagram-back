import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserProfileDto {
  @Length(1, 40)
  @IsString()
  @IsNotEmpty()
  name: string;
  @Length(1, 40)
  @IsString()
  @IsNotEmpty()
  surname: string;
  @IsDate()
  @IsOptional()
  birthday: Date | null;
  @Length(1, 60)
  @IsString()
  @IsNotEmpty()
  city: string;
  @Length(1, 200)
  @IsString()
  @IsOptional()
  aboutMe: string | null;
}