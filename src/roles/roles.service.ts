import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.save(this.roleRepository.create(createRoleDto));
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    return this.roleRepository.findOneBy({ id: id });
  }

  update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleRepository.save({ ...updateRoleDto, id: id });
  }

  remove(id: number) {
    return this.roleRepository.softRemove({ id: id });
  }
}
