import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/permission.decorator';
import { AuthFastifyRequest } from 'src/auth/type/request.user';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationType } from 'src/notification/types/notification';
import { PermissionEnum } from 'src/roles/entities/types';
import { InviteSendDto } from './dto/invite-send.dto';
import { RegisterTeamDto } from './dto/register-team.dto';
import { TeamDto } from './dto/team.dto';
import { PlayerStatus } from './enums/player.enum';
import { PlayersService } from 'src/players/players.service';
import { TeamsService } from './teams.service';
import { InvitationVerificationDto } from './dto/invitation.dto';

@ApiTags('Teams')
@Controller({
  path: 'teams',
  version: '1',
})
export class TeamsController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly teamsService: TeamsService,
    private readonly configService: ConfigService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Auth(PermissionEnum.MATCH_MAKE)
  @Post('register')
  async register(
    @Body() teamDto: RegisterTeamDto,
    @Req() req: AuthFastifyRequest,
  ): Promise<TeamDto> {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    return await this.teamsService.create(teamDto, leader);
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Patch()
  async update(
    @Req() req: AuthFastifyRequest,
    @Body() teamDto: TeamDto,
  ): Promise<TeamDto> {
    const leader = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const team = await this.teamsService.get(leader);
    if (!team || team.leader.userId != leader.userId)
      throw new NotFoundException('No team exists');
    await this.teamsService.save(teamDto);
    return teamDto;
  }
  @Auth(PermissionEnum.MATCH_MAKE)
  @Get()
  async fetch(@Req() req: AuthFastifyRequest): Promise<TeamDto> {
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    const team = await this.teamsService.get(player);
    if (!team) throw new NotFoundException('No team exists');
    return team;
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('invite')
  async inviteSend(
    @Query() inviteSendDto: InviteSendDto,
    @Req() req: AuthFastifyRequest,
  ) {
    const { invitedTeam, invitedPlayer } = await this.validateInvitationRequest(
      req.user.id,
      inviteSendDto.playerUserId,
    );
    const invitationLink = await this.teamsService.createInvitationLink(
      invitedTeam,
      invitedPlayer,
    );
    this.notificationGateway.sendNotification(
      invitedPlayer.user,
      NotificationType.teamInvitation,
      {
        data: { invitationLink },
        message: 'You have been invited to join a team',
      },
    );
    return { invitationLink };
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('invitation/accept')
  async invitationAccept(
    @Query('token') token: string,
    @Req() req: AuthFastifyRequest,
  ) {
    const invitation = await this.teamsService.verifyInvitation(token);
    const team = await this.validateInvitation(invitation, req.user.id);
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    team.players.push({ player, status: PlayerStatus.inactive });
    await this.teamsService.save(team);
    this.notificationGateway.sendNotification(
      team.leader.user,
      NotificationType.teamInvitationAccept,
      {
        data: { team },
        message: `${player.activisionId} has accepted your invitation`,
      },
    );
    team.players.forEach((x) => {
      this.notificationGateway.sendNotification(
        x.player.user,
        NotificationType.teamInvitationAccept,
        {
          data: { team },
          message: `${player.activisionId} has joined`,
        },
      );
    });
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('invitation/reject')
  async invitationReject(
    @Query('token') token: string,
    @Req() req: AuthFastifyRequest,
  ) {
    const invitation = await this.teamsService.verifyInvitation(token);
    const team = await this.validateInvitation(invitation, req.user.id);
    const player = await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
    });
    this.notificationGateway.sendNotification(
      team.leader.user,
      NotificationType.teamInvitationReject,
      {
        data: { team },
        message: `${player.activisionId} has rejected your invitation`,
      },
    );
  }
  private async validateInvitation(
    invitation: InvitationVerificationDto,
    userId: number,
  ) {
    if (invitation.playerId !== userId)
      throw new BadRequestException('Invalid invitation');
    const team = await this.teamsService.get(invitation.teamId);
    if (!team) throw new BadRequestException('No team exists to add player in');
    const playerLimit = this.configService.get<number>('TEAM_PLAYER_LIMIT');
    if (team.players.length >= playerLimit)
      throw new BadRequestException('Team is full');
    const playerAlreadyExist = team.players.filter(
      (x) => x.player.user.id === userId,
    ).length;
    if (playerAlreadyExist)
      throw new BadRequestException('Player already in team');
    return team;
  }

  private async validateInvitationRequest(
    invitingLeaderId: number,
    invitedPlayerId: number,
  ) {
    if (invitingLeaderId === invitedPlayerId)
      throw new BadRequestException('You cannot invite yourself');
    const invitedPlayer = await this.playersService.findOneBy({
      where: { user: { id: invitedPlayerId } },
    });
    if (!invitedPlayer) throw new BadRequestException('Player not found');
    const invitedLeader = await this.playersService.findOneBy({
      where: { user: { id: invitingLeaderId } },
    });
    const invitedTeam = await this.teamsService.get(invitedLeader);
    if (!invitedTeam)
      throw new BadRequestException('No team exists to add player in');
    const playerLimit = this.configService.get<number>('TEAM_PLAYER_LIMIT');
    if (invitedTeam.players.length >= playerLimit)
      throw new BadRequestException('Team is full');
    return { invitedTeam, invitedPlayer, invitedLeader };
  }
}
