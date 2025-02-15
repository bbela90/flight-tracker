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
import { FlightDto, FlightWithIdDto } from '../common/dto/flights.dto';
import { ApiTags, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('bearerAuth')
@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of flights',
    type: [FlightWithIdDto],
  })
  getFlightsList(): Promise<FlightWithIdDto[]> {
    return this.flightsService.getAllFlights();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Flight details',
    type: FlightWithIdDto,
  })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async getFlight(@Param('id') id: string): Promise<FlightWithIdDto> {
    return await this.flightsService.getFlight(id);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Flight successfully created',
    type: FlightWithIdDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async addFlight(@Body() body: FlightDto): Promise<{ id: string }> {
    const createdId = await this.flightsService.addFlight(body);
    return { id: createdId };
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Flight updated',
    type: FlightWithIdDto,
  })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  updateFlight(
    @Param('id') id: string,
    @Body() body: FlightDto,
  ): Promise<FlightWithIdDto> {
    return this.flightsService.updateFlight(id, body);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Flight deleted' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  deleteFlight(@Param('id') id: string): Promise<void> {
    return this.flightsService.deleteFlight(id);
  }
}
