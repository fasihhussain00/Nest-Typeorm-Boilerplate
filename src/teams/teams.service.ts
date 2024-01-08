import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as uuid from 'uuid';
import { Player } from '../players/entities/player.entity';
import { teamKeyPrefix, teamPrefix } from './consts/teams.const';
import { TeamStatus } from './enums/player.enum';
import { RegisterTeamDto } from './dto/register-team.dto';
import { TeamDto } from './dto/team.dto';
import { InvitationVerificationDto } from './dto/invitation.dto';
@Injectable()
export class TeamsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async create(teamDto: RegisterTeamDto, leader: Player): Promise<TeamDto> {
    const team: TeamDto = {
      id: uuid.v4(),
      name: teamDto.name,
      leader: leader,
      players: [],
      status: TeamStatus.inactive,
    };
    const teamKey = this.getTeamKey(team.id);
    this.setPlayerKey(leader.user.id, teamKey);
    await this.cacheManager.set(teamKey, team, 20000000);
    return team;
  }

  async save(teamDto: TeamDto) {
    const teamKey = this.getTeamKey(teamDto.id);
    for (const player of teamDto.players) {
      await this.setPlayerKey(player.player.user.id, teamKey);
    }
    await this.cacheManager.set(teamKey, teamDto, 20000000);
  }

  async get(playerOrTeamId: Player | string): Promise<TeamDto> {
    let key = null;
    if (typeof playerOrTeamId === 'string') {
      key = this.getTeamKey(playerOrTeamId);
    } else {
      key = await this.findTeamKey(playerOrTeamId?.user?.id);
    }
    return await this.cacheManager.get<TeamDto>(key);
  }
  async remove(playerOrTeamId: Player | string) {
    let key = null;
    if (typeof playerOrTeamId === 'string') {
      key = this.getTeamKey(playerOrTeamId);
    } else {
      key = await this.findTeamKey(playerOrTeamId?.user?.id);
    }
    await this.cacheManager.del(key);
  }

  async createInvitationLink(team: TeamDto, player: Player): Promise<string> {
    const invitationLink = this.configService.get<string>('INVITATION_LINK');
    const token = this.jwtService.sign(
      {
        teamId: team.id,
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

  private getTeamKey(teamId: string): string {
    return teamPrefix + teamId;
  }

  private async setPlayerKey(playerId: number, teamKey: string) {
    const key = teamKeyPrefix + playerId;
    return await this.cacheManager.set(key, teamKey, 20000000);
  }

  private async findTeamKey(playerId: number): Promise<string> {
    const key = teamKeyPrefix + playerId;
    return await this.cacheManager.get<string>(key);
  }
}
