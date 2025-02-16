import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app/app.module';
import { TokenDto } from '../../src/common/dto/auth.dto';
import { MongoClient } from 'mongodb';

process.env.DB_FLIGHTS = `flights_test_${Date.now()}`;
const DB_HOST_URL = process.env.DB_HOST_URL as string;
const DB_NAME = process.env.DB_NAME as string;
const DB_FLIGHTS = process.env.DB_FLIGHTS;

interface CreateFlightResponseBody {
  id: string;
}

describe('Flights (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: TokenDto;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'testuser', password: 'testpassword1' });

    authToken = loginResponse.body as TokenDto;
  });

  afterAll(async () => {
    const client = await MongoClient.connect(DB_HOST_URL);
    const db = client.db(DB_NAME);
    await db.collection(DB_FLIGHTS).drop();
    await client.close();

    await app.close();
  });

  it('POST /flights creates a flight and GET /flights/:id returns it', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRU',
      destination: 'BUD',
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

  it('PATCH /flights/:id should update a flight and return the updated flight data', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRU',
      destination: 'BUD',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/flights')
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(flightData)
      .expect(201);

    const createdFlight = createResponse.body as CreateFlightResponseBody;
    const flightId = createdFlight.id;

    const patchData = { departure: 'CRL' };

    const patchResponse = await request(app.getHttpServer())
      .patch(`/flights/${flightId}`)
      .set('Authorization', `Bearer ${authToken.token}`)
      .send(patchData)
      .expect(200);

    expect(patchResponse.body).toEqual({
      id: flightId,
      aircraft: flightData.aircraft,
      flightNumber: flightData.flightNumber,
      schedule: flightData.schedule,
      departure: patchData.departure,
      destination: flightData.destination,
    });
  });

  it('DELETE /flights/:id should delete a flight and return 204', async () => {
    const flightData = {
      aircraft: 'Boeing 737',
      flightNumber: 'UA123',
      schedule: {
        std: '2025-02-15T14:30:00Z',
        sta: '2025-02-15T17:30:00Z',
      },
      departure: 'BRU',
      destination: 'BUD',
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
});

// import * as request from 'supertest';
// import { Test } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { AppModule } from './../src/app.module';
//
// describe('Flights (e2e)', () => {
//   let app: INestApplication;
//   let authToken: string;
//
//   beforeAll(async () => {
//     const moduleFixture = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//
//     // Log in to get an authentication token (adjust route and payload as needed)
//     const loginResponse = await request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ username: 'testuser', password: 'testpassword' });
//
//     // Assuming the token is returned in loginResponse.body.token
//     authToken = loginResponse.body.token;
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('GET /flights should return an array of flights when authenticated', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/flights')
//       .set('Authorization', `Bearer ${authToken}`)
//       .expect(200);
//
//     expect(Array.isArray(response.body)).toBe(true);
//     // Optionally, add more assertions about the structure of the flight objects.
//   });
// });
