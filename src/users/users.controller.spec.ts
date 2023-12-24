import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersController', () => {
  let controller: UsersController;
  const user = {
    id: 1,
    sourceId: '1',
    name: 'John',
    email: 'john@yopmail.com',
    password: '123',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: () => new Promise((resolve) => resolve(user)),
            update: () => new Promise((resolve) => resolve(user)),
            remove: () => new Promise((resolve) => resolve(user)),
            findOne: () => new Promise((resolve) => resolve(user)),
            findAll: () => new Promise((resolve) => resolve([user])),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('create', async () => {
    expect(await controller.create(user as CreateUserDto)).toEqual(user);
  });
  it('update', async () => {
    expect(await controller.update(user.id, user)).toEqual(user);
  });
  it('remove', async () => {
    expect(await controller.remove(user.id)).toEqual(user);
  });
  it('find', async () => {
    expect(await controller.findOne(user.id)).toEqual(user);
  });
  it('findAll', async () => {
    expect(await controller.findAll()).toEqual([user]);
  });
});
