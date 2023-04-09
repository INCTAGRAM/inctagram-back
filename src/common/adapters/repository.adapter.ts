import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class QueryRepositoryAdapter {
  public abstract create(...data: any): Promise<any>;

  public abstract deleteAll(): Promise<any>;
}
