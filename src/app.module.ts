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
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ cache: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    HealthModule,
    RolesModule,
    AuthModule,
    ScopeDetectionModule,
    FilesModule,
    PlayersModule,
  ],
})
export class AppModule {}
