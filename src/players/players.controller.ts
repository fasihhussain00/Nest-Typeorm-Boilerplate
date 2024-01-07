import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/permission.decorator';
import { AuthFastifyRequest } from 'src/auth/type/request.user';
import { PermissionEnum } from 'src/roles/entities/types';
import { RolesService } from 'src/roles/roles.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerDto } from './dto/register-player.dto';
import { RegisterTeamDto } from './dto/register-team.dto';
import { TeamDto } from './dto/team.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';
import { SearchDto } from 'src/db/dto/search.dto';
import { InviteSendDto } from './dto/invite-send.dto';
import { ConfigService } from '@nestjs/config';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { PlayerStatus } from './enums/player.enum';
import { NotificationType } from 'src/notification/types/notification';
import { LobbyDto } from './dto/lobby.dto';

@ApiTags('Players')
@Controller({
  path: 'players',
  version: '1',
})
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly roleService: RolesService,
    private readonly configService: ConfigService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    const roles = await Promise.all(
      createPlayerDto.user.roles.map((role) => this.roleService.findOne(role)),
    );
    return await this.playersService.create({
      ...createPlayerDto,
      user: { ...createPlayerDto.user, roles: roles },
    });
  }

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    const roles = await Promise.all(
      updatePlayerDto.user.roles.map((role) => this.roleService.findOne(role)),
    );
    return await this.playersService.update(+id, {
      ...updatePlayerDto,
      user: {
        ...updatePlayerDto.user,
        roles: roles,
      },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(+id);
  }
  @Post('register')
  async registerPlayer(@Body() playerDto: PlayerDto): Promise<Player> {
    const role = await this.findRoleOrThrow('player');
    return await this.playersService.create({
      activisionId: playerDto.activisionId,
      username: playerDto.username,
      user: {
        name: playerDto.name,
        email: playerDto.email,
        password: playerDto.password,
        roles: [role],
      },
    });
  }
  @Auth(PermissionEnum.MATCH_MAKE)
  @Post('teams/register')
  async registerTeam(
    @Body() teamDto: RegisterTeamDto,
    @Req() req: AuthFastifyRequest,
  ): Promise<TeamDto> {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    return await this.playersService.createTeam(teamDto, leader);
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Patch('teams')
  async updateTeam(
    @Req() req: AuthFastifyRequest,
    @Body() teamDto: TeamDto,
  ): Promise<TeamDto> {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const team = await this.playersService.getTeam(leader);
    if (!team || team.leader.userId != leader.userId)
      throw new NotFoundException('No team exists');
    await this.playersService.saveTeam(teamDto);
    return teamDto;
  }
  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('teams')
  async fetchTeam(@Req() req: AuthFastifyRequest): Promise<TeamDto> {
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    let team = await this.playersService.getTeam(player);
    team = team ?? (await this.playersService.getPlayersTeam(player));
    if (team) return team;
    throw new NotFoundException('No team exists');
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('lobbies')
  async fetchLobby(
    @Req() req: AuthFastifyRequest,
    @Query('otherLeaderId') otherLeaderId: number,
  ): Promise<LobbyDto> {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const lobby = await this.playersService.getLobby(
      leader.userId,
      otherLeaderId,
    );
    if (!lobby) throw new NotFoundException('No lobby exists');
    return lobby;
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('search')
  async search(@Query() searchDto: SearchDto): Promise<Player[]> {
    return await this.playersService.search(searchDto.search, searchDto.field);
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('me')
  async me(@Req() req: AuthFastifyRequest): Promise<Player> {
    return await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
  }
  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('invite/send')
  async inviteSend(
    @Query() inviteSendDto: InviteSendDto,
    @Req() req: AuthFastifyRequest,
  ) {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const player = await this.playersService.findOneBy({
      where: { user: { id: inviteSendDto.playerUserId } },
    });
    if (!player) throw new BadRequestException('Player not found');
    if (leader.user.id === player.user.id)
      throw new BadRequestException('You cannot invite yourself');
    const team = await this.playersService.getTeam(leader);
    if (!team) throw new BadRequestException('No team exists to add player in');
    if (
      team.players.length >= this.configService.get<number>('TEAM_PLAYER_LIMIT')
    )
      throw new BadRequestException('Team is full');
    const invitationLink = await this.playersService.createTeamInvitationLink(
      team,
      player,
    );
    this.notificationGateway.sendNotification(
      player.user,
      NotificationType.teamInvitation,
      {
        data: { invitationLink },
        message: 'You have been invited to join a team',
      },
    );
    return { invitationLink };
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('invite')
  async invite(@Query('token') token: string, @Req() req: AuthFastifyRequest) {
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const invitation = await this.playersService.verifyInvitation(token);
    if (invitation.playerId !== player.user.id)
      throw new BadRequestException('Invalid invitation');
    const leader = await this.playersService.findOneBy({
      where: { user: { id: invitation.leaderId } },
    });
    const team = await this.playersService.getTeam(leader);
    if (!team) throw new BadRequestException('No team exists to add player in');
    if (
      team.players.length >= this.configService.get<number>('TEAM_PLAYER_LIMIT')
    )
      throw new BadRequestException('Team is full');
    const playerAlreadyExist = team.players.filter(
      (x) => x.player.user.id === player.user.id,
    ).length;
    if (playerAlreadyExist)
      throw new BadRequestException('Player already in team');
    team.players.push({ player, status: PlayerStatus.inactive });
    await this.playersService.saveTeam(team);
  }

  private async findRoleOrThrow(name: string) {
    const role = await this.roleService.findOneBy({ name });
    if (!role)
      throw new BadRequestException(
        { message: 'This api is not enabled by admin yet' },
        'This api is not enabled by admin yet',
      );
    return role;
  }
}
