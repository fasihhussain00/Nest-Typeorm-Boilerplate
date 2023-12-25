import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from 'src/roles/roles.controller';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/entities/role.entity';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionEnum } from './entities/types';

describe('RolesController', () => {
  let controller: RolesController;
  const role = {
    id: 1,
    name: 'admin',
    permissions: [PermissionEnum.USER_WRITE],
  } as Role;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            create: () => new Promise((resolve) => resolve(role)),
            update: () => new Promise((resolve) => resolve(role)),
            remove: () => new Promise((resolve) => resolve(role)),
            findOne: () => new Promise((resolve) => resolve(role)),
            findAll: () => new Promise((resolve) => resolve([role])),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {},
        },
      ],
    }).compile();
    controller = module.get<RolesController>(RolesController);
  });

  it('create', async () => {
    expect(await controller.create(role as CreateRoleDto)).toEqual(role);
  });
  it('update', async () => {
    expect(await controller.update(role.id, role)).toEqual(role);
  });
  it('remove', async () => {
    expect(await controller.remove(role.id)).toEqual(role);
  });
  it('find', async () => {
    expect(await controller.findOne(role.id)).toEqual(role);
  });
  it('findAll', async () => {
    expect(await controller.findAll()).toEqual([role]);
  });
});
