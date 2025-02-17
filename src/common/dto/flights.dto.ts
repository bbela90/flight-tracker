import { IsString, ValidateNested, IsISO8601, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleDto {
  @ApiProperty({
    description: 'The scheduled time of departure, ISO 8601 format',
    format: 'date-time',
    example: '2025-02-15T14:30:00Z',
  })
  @IsISO8601()
  std: string;

  @ApiProperty({
    description: 'The scheduled time of arrival, ISO 8601 format',
    format: 'date-time',
    example: '2025-02-15T17:30:00Z',
  })
  @IsISO8601()
  sta: string;
}

export class FlightDto {
  @ApiProperty({
    description: 'A code describing the aircraft assigned to the flight',
    minLength: 1,
    maxLength: 10,
    example: 'CSTRC',
  })
  @IsString()
  @Length(1, 10)
  aircraft: string;

  @ApiProperty({
    description: 'A code that identifies the flight',
    minLength: 1,
    maxLength: 10,
    example: 'AVIO201',
  })
  @IsString()
  @Length(1, 10)
  flightNumber: string;

  @ApiProperty({ description: 'Flight schedule', type: () => ScheduleDto })
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty({
    description: 'Identifier for the departure airport',
    minLength: 4,
    maxLength: 4,
    example: 'LPPD',
  })
  @IsString()
  @Length(4, 4)
  departure: string;

  @ApiProperty({
    description: 'Identifier for the destination airport',
    minLength: 4,
    maxLength: 4,
    example: 'LPLA',
  })
  @IsString()
  @Length(4, 4)
  destination: string;
}

export class FlightWithIdDto extends FlightDto {
  @ApiProperty({ description: 'Unique flight ID', example: 'abc123' })
  @IsString()
  id: string;
}

export class FlightDocDto extends FlightDto {
  @ApiProperty({
    description: 'MongoDB document ID',
    example: '65a9c9f0e5b5c8b5bfb3d7f1',
  })
  @IsString()
  _id: string;
}
