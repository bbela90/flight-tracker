import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly authService: AuthService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token missing');
    }
    const token = authHeader.split(' ')[1];

    try {
      req['user'] = this.authService.verifyToken(token);
      next();
    } catch (e) {
      this.logger.log('Error verifying token', e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
