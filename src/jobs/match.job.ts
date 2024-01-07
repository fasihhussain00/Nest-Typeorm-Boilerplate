import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TeamDto } from 'src/players/dto/team.dto';
import { TeamStatus } from 'src/players/enums/player.enum';
import { shuffle } from 'src/utils/array';
import { NotificationType } from 'src/notification/types/notification';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class MatchJobs {
  private readonly logger = new Logger(MatchJobs.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly notificationGateway: NotificationGateway,
    private readonly playersService: PlayersService,
  ) {}
  @Interval(1000)
  async searchForMatches() {
    const keys = await this.cacheManager.store.keys();
    const teamKeys = keys.filter((x) => /leader-\d+-team/.test(x));
    let teamsAvailableForMatch: TeamDto[] = [];
    for (const teamKey of teamKeys) {
      const team = await this.cacheManager.get<TeamDto>(teamKey);
      if (team.status !== TeamStatus.searching) continue;
      teamsAvailableForMatch.push(team);
    }
    this.logger.log(
      `Teams available for match: ${teamsAvailableForMatch.length}`,
    );
    teamsAvailableForMatch = shuffle(teamsAvailableForMatch);
    if (teamsAvailableForMatch.length < 2) return;
    for (let i = 0; i < teamsAvailableForMatch.length; i += 2) {
      const team1 = teamsAvailableForMatch[i];
      const team2 = teamsAvailableForMatch[i + 1];
      const team1Key = `leader-${team1.leader.userId}-team`;
      const team2Key = `leader-${team2.leader.userId}-team`;
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
      await this.cacheManager.del(team1Key);
      await this.cacheManager.del(team2Key);
      await this.playersService.createLobby({ team1, team2 });
    }
  }
}
