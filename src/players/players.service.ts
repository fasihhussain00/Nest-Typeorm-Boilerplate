import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Like,
  Repository,
} from 'typeorm';
import { Player } from './entities/player.entity';
@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  create(player: DeepPartial<Player>) {
    return this.playerRepository.save(this.playerRepository.create(player));
  }

  findAll(options?: FindManyOptions<Player>) {
    return this.playerRepository.find(options);
  }

  findOne(id: number) {
    return this.playerRepository.findOneBy({ id: id });
  }

  findOneBy(options?: FindOneOptions<Player>) {
    return this.playerRepository.findOne(options);
  }

  update(id: number, player: DeepPartial<Player>): Promise<Player> {
    return this.playerRepository.save({ ...player, id: id });
  }

  remove(id: number) {
    return this.playerRepository.softRemove({ id: id });
  }

  async search(search: string, fields: string[] | string) {
    const filters = {};
    if (!Array.isArray(fields)) {
      fields = [fields];
    }
    for (const field of fields) {
      filters[field] = Like(`%${search}%`);
    }
    return await this.playerRepository.find({ where: filters });
  }
}
