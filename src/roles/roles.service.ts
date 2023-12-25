import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  create(role: DeepPartial<Role>) {
    return this.roleRepository.save(this.roleRepository.create(role));
  }

  findAll(options?: FindManyOptions<Role>) {
    return this.roleRepository.find(options);
  }

  findOne(id: number) {
    return this.roleRepository.findOneBy({ id: id });
  }

  findOneBy(options: FindOptionsWhere<Role> | FindOptionsWhere<Role>[]) {
    return this.roleRepository.findOne({ where: options });
  }

  update(id: number, role: DeepPartial<Role>): Promise<Role> {
    return this.roleRepository.save({ ...role, id: id });
  }

  remove(id: number) {
    return this.roleRepository.softRemove({ id: id });
  }
  async mustFind(roleIds: number[]): Promise<MustFindResult> {
    const roles = await this.findAll({
      where: { id: In(roleIds) },
      select: ['id'],
    });
    return { success: roles.length === roleIds.length, roles };
  }
}

interface MustFindResult {
  success: boolean;
  roles: Role[];
}
