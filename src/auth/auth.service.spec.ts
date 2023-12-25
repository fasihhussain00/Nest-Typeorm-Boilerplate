import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './type/login-response';
import { UsersService } from 'src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;
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
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneBy: () => new Promise((resolve) => resolve(user)),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: () =>
              new Promise((resolve) => resolve(authResponse.accessToken)),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login', async () => {
    expect(await service.login(auth)).toEqual(authResponse);
  });
});
