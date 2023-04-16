import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  NotEquals,
  ValidateIf,
} from 'class-validator';
import {
  ABOUT_ME_LENGTH_MAX,
  ABOUT_ME_LENGTH_MIN,
  CITY_LENGTH_MAX,
  CITY_LENGTH_MIN,
  NAME_LENGTH_MAX,
  NAME_LENGTH_MIN,
  SURNAME_LENGTH_MAX,
  SURNAME_LENGTH_MIN,
  USERNAME_LENGTH_MAX,
  USERNAME_LENGTH_MIN,
} from 'src/common/constants';
import { Transform } from 'class-transformer';
import { parse } from 'date-fns';
export class UpdateUserProfileDto {
  @Length(USERNAME_LENGTH_MIN, USERNAME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  @NotEquals(null)
  @ValidateIf((_, value) => value !== undefined)
  username: string;
  @Length(NAME_LENGTH_MIN, NAME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  @NotEquals(null)
  @ValidateIf((_, value) => value !== undefined)
  name?: string;

  @Length(SURNAME_LENGTH_MIN, SURNAME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  @NotEquals(null)
  @ValidateIf((_, value) => value !== undefined)
  surname?: string;
  @Transform(({ value }) => {
    return parse(value, 'yyyy-MM-dd', new Date());
  })
  @IsDate({ message: 'birthday must be ISOString of format yyyy-MM-dd' })
  @IsOptional()
  /* TODO compare with min age of registraton */
  birthday?: Date | null;

  @Length(CITY_LENGTH_MIN, CITY_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  @NotEquals(null)
  @ValidateIf((_, value) => value !== undefined)
  city?: string;

  @Length(ABOUT_ME_LENGTH_MIN, ABOUT_ME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  aboutMe?: string | null;
}
