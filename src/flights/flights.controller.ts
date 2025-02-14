import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Flight } from '../common/interfaces/flights';

@Controller('flights') // Base URL: /flights
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  getFlightsList() {
    return this.flightsService.getAllFlights();
  }

  @Get(':id')
  async getFlight(@Param('id') id: string) {
    return await this.flightsService.getFlight(id);
  }

  @Post()
  async addFlight(@Body() body: Flight) {
    const createdId = await this.flightsService.addFlight(body);
    return { id: createdId };
  }

  @Patch(':id')
  updateFlight(@Param('id') id: string, @Body() body: Flight) {
    return this.flightsService.updateFlight(id, body);
  }

  @Delete(':id')
  deleteFlight(@Param('id') id: string) {
    return this.flightsService.deleteFlight(id);
  }
}
