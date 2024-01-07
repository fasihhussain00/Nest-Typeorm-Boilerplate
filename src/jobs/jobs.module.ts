import { Module, forwardRef } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { MatchJobs } from './match.job';
import { PlayersModule } from 'src/players/players.module';

@Module({
  imports: [forwardRef(() => AppModule), PlayersModule],
  providers: [MatchJobs],
})
export class JobsModule {}
