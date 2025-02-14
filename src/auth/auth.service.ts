import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDetails } from '../common/interfaces/auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  login(loginData: LoginDetails) {
    if (loginData.username !== 'admin' || loginData.password !== 'password') {
      throw new UnauthorizedException('Invalid credentials');
    }
    // TODO add userID to payload -- sub: user.id
    const payload = { username: loginData.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  verifyToken(token: string) {
    // TODO give back user
    this.jwtService.verify(token);
    return true;
  }
}
