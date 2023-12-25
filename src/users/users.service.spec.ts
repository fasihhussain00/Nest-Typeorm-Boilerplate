import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  const user = {
    id: 1,
    sourceId: '1',
    name: 'John',
    email: 'john@yopmail.com',
    password: '123',
    roles: [],
  } as User & CreateUserDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: (entity) => new Promise((resolve) => resolve(entity)),
            save: (entity) => new Promise((resolve) => resolve(entity)),
            find: () => new Promise((resolve) => resolve([user])),
            findOne: () => new Promise((resolve) => resolve(user)),
            findOneBy: () => new Promise((resolve) => resolve(user)),
            softRemove: () => new Promise((resolve) => resolve(user)),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('create', async () => {
    expect(await service.create(user as User)).toEqual(user);
  });
  it('findAll', async () => {
    expect(await service.findAll()).toEqual([user]);
  });
  it('findOne', async () => {
    expect(await service.findOne(user.id)).toEqual(user);
  });
  it('findOneBy', async () => {
    expect(await service.findOneBy()).toEqual(user);
  });
  it('update', async () => {
    expect(await service.update(user.id, user)).toEqual(user);
  });
  it('remove', async () => {
    expect(await service.remove(user.id)).toEqual(user);
  });
});
