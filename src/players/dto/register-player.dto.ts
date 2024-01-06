import { IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsString()
  activisionId: string;
}
