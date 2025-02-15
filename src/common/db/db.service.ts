import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { DbConfig } from '../interfaces/config';
import { FlightDto } from '../dto/flights.dto';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly dbConfig: DbConfig;
  private readonly logger = new Logger(DbService.name);
  private flightsDbCollection: Collection<FlightDto>;

  constructor(private readonly configService: ConfigService) {
    this.dbConfig = this.configService.get('database') as DbConfig;
  }

  async onModuleInit() {
    this.client = new MongoClient(this.dbConfig.url);
    await this.client.connect();
    this.db = this.client.db(this.dbConfig.name);
    this.logger.log('MongoDB Connected');
    // Connect collections - TODO make it dynamic?
    this.flightsDbCollection = this.db.collection(this.dbConfig.flights);
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  get flightsDb() {
    return this.flightsDbCollection;
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('MongoDB Disconnected');
  }
}
