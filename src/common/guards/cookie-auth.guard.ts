import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request?.cookies.refreshToken;
    console.log('refreshtoken', refreshToken);
    if (!refreshToken) {
      request.user = null;
      return true;
    }
    const payload: any = this.jwtService.decode(refreshToken);

    request.user = payload;
    return true;
  }
}
