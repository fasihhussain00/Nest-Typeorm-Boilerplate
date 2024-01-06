import { IsString } from 'class-validator';
export class InviteSendDto {
  @IsString()
  playerUserId: number;
}
