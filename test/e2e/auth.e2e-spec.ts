import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth should return a token', async () => {
    const loginData = {
      username: 'testuser',
      password: 'testpassword1',
    };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(loginData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
  });

  it('/auth should return 400 for invalid payload', async () => {
    const invalidAuthPayload = { username: 'testuser' };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(invalidAuthPayload)
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('/auth should return 401 for wrong password', async () => {
    const loginData = {
      username: 'testuser',
      password: 'testpassword3',
    };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(loginData)
      .expect(401);

    expect(response.body).toHaveProperty('message');
  });
});
