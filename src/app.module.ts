import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/config';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ cache: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    HealthModule,
  ],
})
export class AppModule {}
