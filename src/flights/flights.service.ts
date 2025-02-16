import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DbService } from '../common/db/db.service';
import { transformFlight } from '../utils/flight.transformer';
import { FlightDto, FlightWithIdDto } from '../common/dto/flights.dto';

// TODO consider using Model for DB

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly dbService: DbService) {}

  async addFlight(data: FlightDto): Promise<FlightWithIdDto> {
    this.logger.log(`Adding flight with data ${JSON.stringify(data)}`);
    const result = await this.dbService.flightsDb.insertOne({ ...data });
    return { id: result.insertedId.toHexString(), ...data };
  }

  async getAllFlights(): Promise<FlightWithIdDto[]> {
    const result = await this.dbService.flightsDb.find().toArray();
    return result.map((flight) => transformFlight(flight));
  }

  async getFlight(id: string): Promise<FlightWithIdDto> {
    const result = await this.dbService.flightsDb.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      throw new NotFoundException('Flight not found');
    }
    return transformFlight(result);
  }

  async updateFlight(id: string, data: FlightDto): Promise<FlightWithIdDto> {
    const result = await this.dbService.flightsDb.findOneAndUpdate(
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
    const result = await this.dbService.flightsDb.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Flight not found');
    }
  }
}
