import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDetailsDto, TokenDto } from '../common/dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  login(loginData: LoginDetailsDto): TokenDto {
    if (loginData.username !== 'admin' || loginData.password !== 'password') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: loginData.username,
      sub: '12345', // TODO: Replace with real user ID from database
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string): boolean {
    try {
      // TODO maybe decode and give back username
      this.jwtService.verify(token);
      return true;
    } catch (error) {
      this.logger.log('Verify token error', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
