import { ObjectId, Collection } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from '../../../src/flights/flights.service';
import { DbService } from '../../../src/common/db/db.service';
import { FlightDto } from '../../../src/common/dto/flights.dto';
import { NotFoundException } from '@nestjs/common';

describe('FlightsService Tests', () => {
  let flightsService: FlightsService;
  let mockDbService: Partial<DbService>;

  const mockFlightId = '65a9c9f0e5b5c8b5bfb3d7f1';
  const mockFlightDocId = new ObjectId(mockFlightId);
  const flightData: FlightDto = {
    aircraft: 'Boeing 737',
    flightNumber: 'UA123',
    schedule: { std: '2025-02-15T14:30:00Z', sta: '2025-02-15T17:30:00Z' },
    departure: 'BUDA',
    destination: 'CRLA',
  };

  const mockFlightsDb: Partial<Collection<FlightDto>> = {
    insertOne: jest.fn().mockResolvedValue({
      insertedId: new ObjectId(mockFlightId),
    }),
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    mockDbService = {
      flightsDb: mockFlightsDb as Collection<FlightDto>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    flightsService = module.get<FlightsService>(FlightsService);
  });

  describe('addFlight', () => {
    it('should add a flight and return with its ID', async () => {
      const originalFlightData = { ...flightData };

      const result = await flightsService.addFlight(flightData);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.insertOne).toHaveBeenCalledWith(
        flightData,
      );
      expect(result).toEqual({ id: mockFlightId, ...flightData });
      expect(flightData).toEqual(originalFlightData);
    });
  });

  describe('getAllFlights', () => {
    const mockFlights = [
      {
        _id: new ObjectId('65a9c9f0e5b5c8b5bfb3d7f1'),
        aircraft: 'Boeing 737',
        flightNumber: 'AA123',
        schedule: {
          std: '2025-02-15T14:30:00Z',
          sta: '2025-02-15T17:30:00Z',
        },
        departure: 'BRUS',
        destination: 'BUDA',
      },
      {
        _id: new ObjectId('65a9c9f0e5b5c8b5bfb3d7f2'),
        aircraft: 'Boeing 737',
        flightNumber: 'BB234',
        schedule: {
          std: '2025-03-15T10:00:00Z',
          sta: '2025-03-15T13:00:00Z',
        },
        departure: 'BUDA',
        destination: 'BRUL',
      },
    ];

    it('should return all flights transformed using transformFlight', async () => {
      mockDbService.flightsDb!.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockFlights),
      });

      const expectedFlights = mockFlights.map((flight) => ({
        id: flight._id.toHexString(),
        aircraft: flight.aircraft,
        flightNumber: flight.flightNumber,
        schedule: flight.schedule,
        departure: flight.departure,
        destination: flight.destination,
      }));

      const result = await flightsService.getAllFlights();

      expect(result).toEqual(expectedFlights);
    });
  });

  describe('getFlightById', () => {
    beforeEach(() => {
      mockDbService.flightsDb!.findOne = jest.fn().mockResolvedValue(null);
    });

    it('should return flight details when flight is found', async () => {
      const mockFlightFromDb = {
        _id: mockFlightDocId,
        ...flightData,
      };

      mockDbService.flightsDb!.findOne = jest
        .fn()
        .mockResolvedValue(mockFlightFromDb);

      const expectedFlight = {
        id: mockFlightId,
        ...flightData,
      };

      const result = await flightsService.getFlight(mockFlightId);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.findOne).toHaveBeenCalledWith({
        _id: mockFlightDocId,
      });
      expect(result).toEqual(expectedFlight);
    });

    it('should throw NotFoundException when flight is not found', async () => {
      await expect(flightsService.getFlight(mockFlightId)).rejects.toThrow(
        new NotFoundException('Flight not found'),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.findOne).toHaveBeenCalledWith({
        _id: mockFlightDocId,
      });
    });
  });

  describe('updateFlight', () => {
    it('should update a flight and return the updated flight details', async () => {
      const updatedFlightFromDb = {
        _id: mockFlightDocId,
        ...flightData,
      };

      mockDbService.flightsDb!.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(updatedFlightFromDb);

      const expectedFlight = {
        id: mockFlightId,
        ...flightData,
      };

      const result = await flightsService.updateFlight(
        mockFlightId,
        flightData,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockFlightDocId },
        { $set: flightData },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(expectedFlight);
    });

    it('should throw NotFoundException when the flight is not found', async () => {
      mockDbService.flightsDb!.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        flightsService.updateFlight(mockFlightId, flightData),
      ).rejects.toThrow(new NotFoundException('Flight not found'));

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockFlightDocId },
        { $set: flightData },
        { returnDocument: 'after' },
      );
    });
  });

  describe('deleteFlight', () => {
    it('should delete a flight successfully', async () => {
      mockDbService.flightsDb!.deleteOne = jest.fn().mockResolvedValue({
        deletedCount: 1,
      });

      await flightsService.deleteFlight(mockFlightId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.deleteOne).toHaveBeenCalledWith({
        _id: mockFlightDocId,
      });
    });

    it('should throw NotFoundException when flight is not found', async () => {
      mockDbService.flightsDb!.deleteOne = jest.fn().mockResolvedValue({
        deletedCount: 0,
      });

      await expect(flightsService.deleteFlight(mockFlightId)).rejects.toThrow(
        new NotFoundException('Flight not found'),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDbService.flightsDb!.deleteOne).toHaveBeenCalledWith({
        _id: mockFlightDocId,
      });
    });
  });
});
