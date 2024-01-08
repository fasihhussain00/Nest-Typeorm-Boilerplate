import { IsString } from 'class-validator';

export class RegisterTeamDto {
  @IsString()
  name: string;
}
