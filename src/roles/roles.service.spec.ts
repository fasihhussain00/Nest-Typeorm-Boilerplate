import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionEnum } from './entities/types';

describe('RolesService', () => {
  let service: RolesService;
  const role = {
    id: 1,
    name: 'admin',
    permissions: [PermissionEnum.USER_WRITE],
  } as Role;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            create: (entity) => new Promise((resolve) => resolve(entity)),
            save: (entity) => new Promise((resolve) => resolve(entity)),
            find: () => new Promise((resolve) => resolve([role])),
            findOneBy: () => new Promise((resolve) => resolve(role)),
            softRemove: () => new Promise((resolve) => resolve(role)),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('create', async () => {
    expect(await service.create(role as CreateRoleDto)).toEqual(role);
  });
  it('findAll', async () => {
    expect(await service.findAll()).toEqual([role]);
  });
  it('findOne', async () => {
    expect(await service.findOne(role.id)).toEqual(role);
  });
  it('update', async () => {
    expect(await service.update(role.id, role)).toEqual(role);
  });
  it('remove', async () => {
    expect(await service.remove(role.id)).toEqual(role);
  });
});
