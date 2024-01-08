import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/permission.decorator';
import { AuthFastifyRequest } from 'src/auth/type/request.user';
import { PermissionEnum } from 'src/roles/entities/types';
import { LobbyDto } from './dto/lobby.dto';
import { LobbiesService } from './lobbies.service';
import { PlayersService } from 'src/players/players.service';

@ApiTags('Lobbies')
@Controller({
  path: 'players',
  version: '1',
})
export class LobbiesController {
  constructor(
    private readonly lobbiesService: LobbiesService,
    private readonly playersService: PlayersService,
  ) {}

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('lobbies')
  async fetchLobby(@Req() req: AuthFastifyRequest): Promise<LobbyDto> {
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const lobby = await this.lobbiesService.get(player);
    if (!lobby) throw new NotFoundException('No lobby exists');
    return lobby;
  }
}
