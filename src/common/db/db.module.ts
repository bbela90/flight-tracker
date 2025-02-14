import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: DbService,
      useFactory: async (configService: ConfigService) => {
        const dbService = new DbService(configService);
        await dbService.onModuleInit();
        return dbService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DbService],
})
export class DbModule {}
