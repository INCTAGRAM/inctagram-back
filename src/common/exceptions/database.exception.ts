import { InternalServerErrorException } from '@nestjs/common';

export class DatabaseException extends InternalServerErrorException {
  public constructor() {
    super({ cause: 'Database error' });
  }
}
