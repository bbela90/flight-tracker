import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from '../flights/flights.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../common/config/config';
import { validateConfig } from '../common/config/config.validation';
import { DbModule } from '../common/db/db.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { FlightsController } from '../flights/flights.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
    }),
    AuthModule,
    DbModule,
    FlightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(FlightsController);
  }
}
