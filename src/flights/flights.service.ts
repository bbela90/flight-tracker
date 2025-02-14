import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { Flight, FlightWithId } from '../common/interfaces/flights';
import { DbService } from '../common/db/db.service';
import { transformFlight } from '../utils/flight.transformer';

// TODO consider using Model for DB

@Injectable()
export class FlightsService {
  private readonly flightsDb: Collection<Flight>;
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly dbService: DbService) {
    this.flightsDb = this.dbService.getDb().collection('flights');
  }

  async addFlight(data: Flight): Promise<string> {
    this.logger.log(`Adding flight with data ${JSON.stringify(data)}`);
    const result = await this.flightsDb.insertOne(data);
    return result.insertedId.toHexString();
  }

  async getAllFlights(): Promise<FlightWithId[]> {
    const result = await this.flightsDb.find().toArray();
    return result.map((flight) => transformFlight(flight));
  }

  async getFlight(id: string): Promise<FlightWithId> {
    const result = await this.flightsDb.findOne({ _id: new ObjectId(id) });

    if (!result) {
      throw new NotFoundException('Flight not found');
    }
    return transformFlight(result);
  }

  async updateFlight(id: string, data: Flight) {
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

  async deleteFlight(id: string) {
    const result = await this.flightsDb.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Flight not found');
    }
  }
}
