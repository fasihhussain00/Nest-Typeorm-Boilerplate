import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as uuid from 'uuid';
import { LobbyDto, LobbyRegisterDto, LobbyStatus } from './dto/lobby.dto';
import { Player } from 'src/players/entities/player.entity';
import { lobbyKeyPrefix, lobbyPrefix } from './consts/lobbies.const';
@Injectable()
export class LobbiesService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

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
    const lobbyKey = this.getLobbyKey(lobby.id);
    const players = lobbyDto.team1.players.concat(lobbyDto.team2.players);
    for (const player of players) {
      await this.setPlayerKey(player.player.user.id, lobbyKey);
    }
    await this.cacheManager.set(lobbyKey, lobby, 20000000);
    return lobby;
  }
  async get(playerOrLobbyId: Player | string): Promise<LobbyDto> {
    let key = null;
    if (typeof playerOrLobbyId === 'string') {
      key = this.getLobbyKey(playerOrLobbyId);
    } else {
      key = await this.findLobbyKey(playerOrLobbyId?.user?.id);
    }
    return await this.cacheManager.get<LobbyDto>(key);
  }
  private getLobbyKey(lobbyId: string): string {
    return lobbyPrefix + lobbyId;
  }

  private async setPlayerKey(playerId: number, teamKey: string) {
    const key = lobbyKeyPrefix + playerId;
    return await this.cacheManager.set(key, teamKey, 20000000);
  }

  private async findLobbyKey(playerId: number): Promise<string> {
    const key = lobbyKeyPrefix + playerId;
    return await this.cacheManager.get<string>(key);
  }
}
