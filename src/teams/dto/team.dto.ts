import { IsString, IsObject } from 'class-validator';
import { Player } from 'src/players/entities/player.entity';

export class TeamPlayerDto {
  player: Player;
  @IsString()
  status: string;
}

export class TeamDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsObject()
  leader: Player;

  @IsObject({
    each: true,
  })
  players: TeamPlayerDto[];

  @IsString()
  status: string;
}
