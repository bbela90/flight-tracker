import { FlightDto, FlightWithIdDto } from '../common/dto/flights.dto';
import { WithId } from 'mongodb';

export function transformFlight(document: WithId<FlightDto>): FlightWithIdDto {
  const { _id, ...rest } = document;
  return {
    ...rest,
    id: _id.toHexString(),
  };
}
