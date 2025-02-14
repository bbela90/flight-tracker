import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { DbConfig } from '../interfaces/config';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly dbConfig: DbConfig;
  private readonly logger = new Logger(DbService.name);
  private flightsDb: Collection<Document>;

  constructor(private readonly configService: ConfigService) {
    this.dbConfig = this.configService.get('database') as DbConfig;
    this.logger.log(this.dbConfig);
  }

  async onModuleInit() {
    this.client = new MongoClient(this.dbConfig.url);
    await this.client.connect();
    this.db = this.client.db(this.dbConfig.name);
    this.logger.log('MongoDB Connected');
    // Connect collections - TODO make it dynamic?
    this.flightsDb = this.db.collection(this.dbConfig.flights);
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('MongoDB Disconnected');
  }
}
