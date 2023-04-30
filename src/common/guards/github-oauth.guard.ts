import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class GithubGuard extends AuthGuard('github') {
  public canActivate(
    context: ExecutionContext,
  ): boolean | Observable<boolean> | Promise<boolean> {
    try {
      return super.canActivate(context);
    } catch (_) {
      throw new UnauthorizedException();
    }
  }
}
