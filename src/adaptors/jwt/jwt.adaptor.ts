import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { UserRepository } from '../../user/repositories/user.repository';
@Injectable()
export class JwtAdaptor {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private userRepository: UserRepository,
  ) {}

  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId },
        {
          secret: this.config.get<string>('AT_SECRET'),
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        { userId },
        {
          secret: this.config.get<string>('RT_SECRET'),
          expiresIn: '2h',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getIssuedAtFromRefreshToken(refreshToken: string) {
    const decodedToken: any = await this.jwtService.decode(refreshToken);
    const issuedAt = new Date(decodedToken.iat * 1000).toISOString();
    return issuedAt;
  }
  async updateTokensHash(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    const accessTokenHash = await argon.hash(tokens.accessToken);
    const refreshTokenHash = await argon.hash(tokens.refreshToken);
    return {
      accessTokenHash,
      refreshTokenHash,
    };
  }
  async validateTokens(refreshToken: string, userId: string) {
    const isToken = await this.userRepository.findTokenByUserId(userId);
    if (!isToken || !isToken.refreshTokenHash || !isToken.accessTokenHash)
      throw new UnauthorizedException('Access denied');
    const rtMatches = await argon.verify(
      isToken.refreshTokenHash,
      refreshToken,
    );
    if (!rtMatches) throw new UnauthorizedException('Access denied');
    return true;
  }
}
