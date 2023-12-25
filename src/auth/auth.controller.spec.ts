import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponse } from './type/login-response';

describe('AuthController', () => {
  let controller: AuthController;
  const auth = {
    email: 'john@yopmail.com',
    password: '123',
  } as LoginDto;
  const user = {
    name: 'john',
    email: 'john@yopmail.com',
    roles: [],
    passwordMatch: () => true,
  };
  const authResponse: LoginResponse = {
    user: user as any,
    accessToken: 'token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: () => new Promise((resolve) => resolve(authResponse)),
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('login', async () => {
    expect(await controller.login(auth as LoginDto)).toEqual(authResponse);
  });
});
