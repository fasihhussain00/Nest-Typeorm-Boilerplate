import { Module, forwardRef } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { RolesModule } from 'src/roles/roles.module';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    RolesModule,
    TypeOrmModule.forFeature([Player]),
    AuthModule,
    ConfigModule,
    forwardRef(() => AppModule),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, TypeOrmModule],
  exports: [PlayersService],
})
export class PlayersModule {}
