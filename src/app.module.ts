import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/config';
import { HealthModule } from './health/health.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ScopeDetectionModule } from './scope-detection/scope-detection.module';
import { FilesModule } from './files/files.module';
import { PlayersModule } from './players/players.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ChatGateway } from './chat/chat.gateway';
import { NotificationGateway } from './notification/notification.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './jobs/jobs.module';
import { TeamsModule } from './teams/teams.module';
import { LobbiesModule } from './lobbies/lobbies.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    UsersModule,
    ConfigModule.forRoot({ cache: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    HealthModule,
    RolesModule,
    AuthModule,
    ScopeDetectionModule,
    FilesModule,
    PlayersModule,
    JobsModule,
    TeamsModule,
    LobbiesModule,
  ],
  providers: [ChatGateway, NotificationGateway],
  exports: [ChatGateway, NotificationGateway],
})
export class AppModule {}
