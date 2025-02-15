import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { DbService } from '../common/db/db.service';
import { transformFlight } from '../utils/flight.transformer';
import { FlightDto, FlightWithIdDto } from '../common/dto/flights.dto';

// TODO consider using Model for DB

@Injectable()
export class FlightsService {
  private readonly flightsDb: Collection<FlightDto>;
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly dbService: DbService) {
    this.flightsDb = this.dbService.getDb().collection('flights');
  }

  async addFlight(data: FlightDto): Promise<string> {
    this.logger.log(`Adding flight with data ${JSON.stringify(data)}`);
    const result = await this.flightsDb.insertOne(data);
    return result.insertedId.toHexString();
  }

  async getAllFlights(): Promise<FlightWithIdDto[]> {
    const result = await this.flightsDb.find().toArray();
    return result.map((flight) => transformFlight(flight));
  }

  async getFlight(id: string): Promise<FlightWithIdDto> {
    const result = await this.flightsDb.findOne({ _id: new ObjectId(id) });

    if (!result) {
      throw new NotFoundException('Flight not found');
    }
    return transformFlight(result);
  }

  async updateFlight(id: string, data: FlightDto): Promise<FlightWithIdDto> {
    const result = await this.flightsDb.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException('Flight not found');
    }

    return transformFlight(result);
  }

  async deleteFlight(id: string): Promise<void> {
    const result = await this.flightsDb.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Flight not found');
    }
  }
}
