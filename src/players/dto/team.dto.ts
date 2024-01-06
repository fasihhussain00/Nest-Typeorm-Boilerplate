import { IsString, IsObject } from 'class-validator';
import { Player } from '../entities/player.entity';

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
  players: Player[];

  @IsString()
  status: string;
}
