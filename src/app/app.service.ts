import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): Record<string, string> {
    return { status: 'online' };
  }
}
