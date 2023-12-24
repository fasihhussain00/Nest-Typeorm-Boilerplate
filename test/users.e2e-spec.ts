import { Test } from '@nestjs/testing';
import { UsersModule } from '../src/users/users.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { getTestDbConnection } from './setup';

describe('users', () => {
  let app: NestFastifyApplication;
  const user = {
    id: 1,
    sourceId: '1',
    name: 'John',
    email: 'john@yopmail.com',
    password: '123',
  } as User;
  beforeAll(async () => {
    const { typeormConfig } = await getTestDbConnection();
    const moduleRef = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forRoot(typeormConfig),
      ],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/POST users`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/users',
      body: { ...user, id: undefined },
    });
    expect(result.statusCode).toEqual(200);
    expect(result.json()).toEqual(user);
  });
  it(`/GET users`, async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/users',
    });
    expect(result.statusCode).toEqual(200);
    expect(result.json()).toEqual([]);
  });

  afterAll(async () => {
    await app?.close();
  });
});
