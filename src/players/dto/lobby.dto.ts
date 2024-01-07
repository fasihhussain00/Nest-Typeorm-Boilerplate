import { IsObject, IsString } from 'class-validator';
import { TeamDto } from './team.dto';

export enum LobbyStatus {
  active = 'active',
  playing = 'playing',
  finished = 'finished',
}

export class LobbyRegisterDto {
  @IsObject()
  team1: TeamDto;

  @IsObject()
  team2: TeamDto;
}

export class LobbyDto {
  @IsString()
  id: string;

  @IsObject()
  team1: TeamDto;

  @IsObject()
  team2: TeamDto;

  @IsObject({ each: true })
  chats?: LobbyChatDto[];

  rockPaperMatch?: RockPaperMatchDto;

  coinTossMatch?: CoinTossMatchDto;

  status: LobbyStatus;
}

export class CoinTossMatchDto {
  headsChosenBy: number;
  tailsChosenBy: number;
  toss: 'heads' | 'tails';
  wonBy: number;
}

export class RockPaperMatchDto {
  rounds: RockPaperRoundDto[];
  winner: number;
}

export class RockPaperRoundDto {
  data: RockPaperRoundDataDto[];
  winner: number;
}

export class RockPaperRoundDataDto {
  userId: number;
  choice: 'rock' | 'paper' | 'scissors';
}

export class LobbyChatDto {
  @IsString()
  id: string;

  @IsString()
  message: string;

  @IsString()
  sentAt: string;

  @IsString()
  sentBy: string;
}
