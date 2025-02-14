export interface Flight {
  aircraft: string;
  flightNumber: string;
  schedule: Schedule;
  departure: string;
  destination: string;
}

export interface FlightWithId extends Flight {
  id: string;
}

export interface FlightDoc extends Flight {
  _id: string;
}

interface Schedule {
  std: string;
  sta: string;
}
