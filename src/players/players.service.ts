import { Inject, Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Like,
  Repository,
} from 'typeorm';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TeamDto } from './dto/team.dto';
import { Cache } from 'cache-manager';
import * as uuid from 'uuid';
import { RegisterTeamDto } from './dto/register-team.dto';
@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
  async createTeam(teamDto: RegisterTeamDto, leader: Player): Promise<TeamDto> {
    const team: TeamDto = {
      id: uuid.v4(),
      name: teamDto.name,
      leader: leader,
      players: [],
      status: 'active',
    };
    await this.cacheManager.set(`leader-${leader.id}-team`, team, 20000000);
    return team;
  }

  async getTeam(leader: Player): Promise<TeamDto> {
    return await this.cacheManager.get<TeamDto>(`leader-${leader.id}-team`);
  }
}
