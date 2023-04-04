import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @Length(1, 100)
  email: string;
  @IsString()
  @Length(6, 20)
  password: string;
}