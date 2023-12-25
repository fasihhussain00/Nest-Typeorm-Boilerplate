import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  create(user: DeepPartial<User>) {
    return this.userRepository.save(this.userRepository.create(user));
  }

  findAll(options?: FindManyOptions<User>) {
    return this.userRepository.find(options);
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id: id });
  }

  findOneBy(options: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return this.userRepository.findOne({ where: options });
  }

  update(id: number, user: DeepPartial<User>): Promise<User> {
    return this.userRepository.save({ ...user, id: id });
  }

  remove(id: number) {
    return this.userRepository.softRemove({ id: id });
  }
}
