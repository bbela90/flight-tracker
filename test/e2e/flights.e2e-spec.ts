import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app/app.module';
import { TokenDto } from '../../src/common/dto/auth.dto';
import { Db, MongoClient } from 'mongodb';
import { FlightWithIdDto } from '../../src/common/dto/flights.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.DB_FLIGHTS = `flights_test_${Date.now()}`;
const DB_NAME = process.env.DB_NAME as string;
const DB_FLIGHTS = process.env.DB_FLIGHTS;

interface CreateFlightResponseBody {
  id: string;
}

describe('Flights (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: TokenDto;
  let mongodb: MongoMemoryServer;
  let db: Db;
  let client: MongoClient;

  beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();

    client = await MongoClient.connect(uri);
    db = client.db(DB_NAME);
  });

  beforeEach(async () => {
    await db.collection(DB_FLIGHTS).drop();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'testuser', password: 'testpassword1' });

    authToken = loginResponse.body as TokenDto;
  });

  afterAll(async () => {
    await db.collection(DB_FLIGHTS).drop();
    await mongodb.stop();
    await app.close();
  });

  it('create and get back by id', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T16:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData)
      .expect(201);

    expect(createResponse.body).toHaveProperty('id');

    const createdFlight = createResponse.body as CreateFlightResponseBody;
    const createdFlightId = createdFlight.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/flights/${createdFlightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(200);

    expect(getResponse.body).toEqual({
      id: createdFlightId,
      ...flightData,
    });
  });

  it('get flights should return all flights', async () => {
    const flightData1 = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const flightData2 = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-03-15T10:00:00Z',
        sta: '2025-03-15T13:00:00Z',
      },
      departure: 'CRLA',
      destination: 'BUDA',
    };

    const createResponse1 = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData1)
      .expect(201);
    const flight1 = (createResponse1.body as CreateFlightResponseBody).id;

    const createResponse2 = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData2)
      .expect(201);
    const flight2 = (createResponse2.body as CreateFlightResponseBody).id;

    const listResponse = await request(app.getHttpServer())
      .get('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);

    const flights = listResponse.body as FlightWithIdDto[];
    expect(flights.length).toBeGreaterThanOrEqual(2);
    const expectedFlight1 = { id: flight1, ...flightData1 };
    const expectedFlight2 = { id: flight2, ...flightData2 };

    const flight1Response = flights.find((flight) => flight.id === flight1);
    const flight2Response = flights.find((flight) => flight.id === flight2);

    expect(flight1Response).toEqual(expectedFlight1);
    expect(flight2Response).toEqual(expectedFlight2);
  });

  it('create then update a flight and return the updated flight data', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData)
      .expect(201);

    const createdFlight = createResponse.body as CreateFlightResponseBody;
    const flightId = createdFlight.id;

    const patchData = { ...flightData, departure: 'CRLO' };

    const patchResponse = await request(app.getHttpServer())
      .patch(`/flights/${flightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(patchData)
      .expect(200);

    expect(patchResponse.body).toEqual({
      id: flightId,
      ...flightData,
      departure: patchData.departure,
    });
  });

  it('create flight get by id and delete', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData)
      .expect(201);

    const createdFlight = createResponse.body as CreateFlightResponseBody;
    const flightId = createdFlight.id;

    await request(app.getHttpServer())
      .delete(`/flights/${flightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/flights/${flightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(404);
  });

  it('create with invalid schema', async () => {
    const invalidFlightPayload = {
      aircraft: 'Boeing 737',
      schedule: {
        std: 'dummy-date',
        sta: 'dummy-date',
      },
      departure: 'BU',
      destination: 'CR',
    };

    const response = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(invalidFlightPayload)
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('update with invalid schema', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData)
      .expect(201);

    const createdFlight = createResponse.body as CreateFlightResponseBody;
    const flightId = createdFlight.id;
    const invalidFlightPayload = {
      aircraft: 'Boeing 737',
      schedule: {
        std: 'dummy-date',
        sta: 'dummy-date',
      },
      departure: 'BU',
      destination: 'CR',
    };

    const response = await request(app.getHttpServer())
      .patch(`/flights/${flightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(invalidFlightPayload)
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('get by id should return 404 when flight is not found', async () => {
    const nonExistentFlightId = '65a9c9f0e5b5c8b5bfb3d7f9';

    const response = await request(app.getHttpServer())
      .get(`/flights/${nonExistentFlightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message');
  });

  it('update flight should return 404 when flight is not found', async () => {
    const nonExistentFlightId = '65a9c9f0e5b5c8b5bfb3d7f9';
    const patchData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRUS',
      destination: 'BUDA',
    };

    const response = await request(app.getHttpServer())
      .patch(`/flights/${nonExistentFlightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(patchData)
      .expect(404);

    expect(response.body).toHaveProperty('message');
  });

  it('delete flight should return 404 when flight is not found', async () => {
    const nonExistentFlightId = '65a9c9f0e5b5c8b5bfb3d7f9';

    const response = await request(app.getHttpServer())
      .delete(`/flights/${nonExistentFlightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message');
  });
});
