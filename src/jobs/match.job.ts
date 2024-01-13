import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { shuffle } from 'src/utils/array';
import { NotificationType } from 'src/notification/types/notification';
import { TeamDto } from 'src/teams/dto/team.dto';
import { TeamStatus } from 'src/teams/enums/player.enum';
import { teamPrefix } from 'src/teams/consts/teams.const';
import { TeamsService } from 'src/teams/teams.service';
import { LobbiesService } from 'src/lobbies/lobbies.service';

@Injectable()
export class MatchJobs {
  private readonly logger = new Logger(MatchJobs.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly notificationGateway: NotificationGateway,
    private readonly teamsService: TeamsService,
    private readonly lobbiesService: LobbiesService,
  ) {}
  @Interval(1000)
  async searchForMatches() {
    const teamKeys = await this.cacheManager.store.keys(teamPrefix + '*');
    let teamsAvailableForMatch: TeamDto[] = [];
    for (const teamKey of teamKeys) {
      const team = await this.cacheManager.get<TeamDto>(teamKey);
      if (team.status !== TeamStatus.searching) continue;
      teamsAvailableForMatch.push(team);
    }
    if (teamsAvailableForMatch.length < 2) return;
    teamsAvailableForMatch = shuffle(teamsAvailableForMatch);
    this.logger.log(
      `Teams available for match: ${teamsAvailableForMatch.length}`,
    );
    for (let i = 0; i < teamsAvailableForMatch.length; i += 2) {
      const team1 = teamsAvailableForMatch[i];
      const team2 = teamsAvailableForMatch[i + 1];
      this.notificationGateway.sendNotification(
        team1.leader.user,
        NotificationType.foundMatch,
        {
          message: `Team ${team2.name} is available for match`,
          data: { team: team2 },
        },
      );
      this.notificationGateway.sendNotification(
        team2.leader.user,
        NotificationType.foundMatch,
        {
          message: `Team ${team1.name} is available for match`,
          data: { team: team1 },
        },
      );
      team1.status = TeamStatus.matchfound;
      team2.status = TeamStatus.matchfound;
      await this.teamsService.save(team1);
      await this.teamsService.save(team2);
      await this.lobbiesService.createLobby({ team1, team2 });
    }
  }
}
