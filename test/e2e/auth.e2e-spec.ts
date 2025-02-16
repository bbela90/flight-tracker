import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app/app.module';
import { TokenDto } from '../../src/common/dto/auth.dto';
import { MongoClient } from 'mongodb';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth should return a JWT token with valid credentials', async () => {
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
});
