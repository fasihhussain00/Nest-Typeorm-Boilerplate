import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { RolesModule } from 'src/roles/roles.module';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [RolesModule, TypeOrmModule.forFeature([Player])],
  controllers: [PlayersController],
  providers: [PlayersService, TypeOrmModule],
})
export class PlayersModule {}
