import { Flight, FlightWithId } from '../common/interfaces/flights';
import { WithId } from 'mongodb';

export function transformFlight(document: WithId<Flight>): FlightWithId {
  const { _id, ...rest } = document;
  return {
    ...rest,
    id: _id.toHexString(),
  };
}
