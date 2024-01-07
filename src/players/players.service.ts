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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InvitationVerificationDto } from './dto/invitation.dto';
import { TeamStatus } from './enums/player.enum';
import { LobbyDto, LobbyRegisterDto, LobbyStatus } from './dto/lobby.dto';
@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
      status: TeamStatus.inactive,
    };
    await this.cacheManager.set(
      `leader-${leader.user.id}-team`,
      team,
      20000000,
    );
    return team;
  }

  async saveTeam(teamDto: TeamDto) {
    await this.cacheManager.set(
      `leader-${teamDto.leader.user.id}-team`,
      teamDto,
      20000000,
    );
  }

  async getTeam(leader: Player): Promise<TeamDto> {
    return await this.cacheManager.get<TeamDto>(
      `leader-${leader.user.id}-team`,
    );
  }

  async createTeamInvitationLink(
    team: TeamDto,
    player: Player,
  ): Promise<string> {
    const invitationLink = this.configService.get<string>('INVITATION_LINK');
    const token = this.jwtService.sign(
      {
        leaderId: team.leader.user.id,
        playerId: player.user.id,
      } as InvitationVerificationDto,
      { expiresIn: '1h' },
    );
    return `${invitationLink}?token=${token}`;
  }

  async verifyInvitation(token: string): Promise<InvitationVerificationDto> {
    const payload = this.jwtService.verify(token);
    return payload;
  }

  async createLobby(lobbyDto: LobbyRegisterDto): Promise<LobbyDto> {
    const lobby: LobbyDto = {
      id: uuid.v4(),
      team1: lobbyDto.team1,
      team2: lobbyDto.team2,
      chats: [],
      coinTossMatch: null,
      rockPaperMatch: null,
      status: LobbyStatus.active,
    };
    const leaderId = lobbyDto.team1.leader.userId;
    const otherLeaderId = lobbyDto.team2.leader.userId;
    const lobbyKey = `lobby-${[leaderId, otherLeaderId].sort().join('-')}`;
    await this.cacheManager.set(lobbyKey, lobby, 20000000);
    return lobby;
  }
  async getLobby(leaderId: number, otherLeaderId: number): Promise<LobbyDto> {
    const lobbyKey = `lobby-${[leaderId, otherLeaderId].sort().join('-')}`;
    return await this.cacheManager.get<LobbyDto>(lobbyKey);
  }
}
