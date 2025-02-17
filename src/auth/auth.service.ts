import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayloadDto,
  LoginDetailsDto,
  TokenDto, VerifiedUserDataDto,
} from '../common/dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../common/interfaces/config';
import { generateUserId } from '../utils/token.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private authConfig: AuthConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.authConfig = this.config.get('auth') as AuthConfig;
  }

  login(loginData: LoginDetailsDto): TokenDto {
    if (
      loginData.username !== this.authConfig.username ||
      loginData.password !== this.authConfig.password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: loginData.username,
      sub: generateUserId(),
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string): VerifiedUserDataDto {
    try {
      const decodedToken: JwtPayloadDto = this.jwtService.verify(token);
      this.logger.log(
        `Token verified for user: ${decodedToken.username} id: ${decodedToken.sub}`,
      );
      return { username: decodedToken.username, id: decodedToken.sub };
    } catch (error) {
      this.logger.log('Verify token error', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
