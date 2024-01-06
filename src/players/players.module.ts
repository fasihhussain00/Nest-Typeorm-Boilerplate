import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { RolesModule } from 'src/roles/roles.module';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [RolesModule, TypeOrmModule.forFeature([Player]), AuthModule],
  controllers: [PlayersController],
  providers: [PlayersService, TypeOrmModule],
})
export class PlayersModule {}
