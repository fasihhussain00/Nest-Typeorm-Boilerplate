import { Module, forwardRef } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { MatchJobs } from './match.job';
import { TeamsModule } from 'src/teams/teams.module';
import { LobbiesModule } from 'src/lobbies/lobbies.module';

@Module({
  imports: [forwardRef(() => AppModule), LobbiesModule, TeamsModule],
  providers: [MatchJobs],
})
export class JobsModule {}
