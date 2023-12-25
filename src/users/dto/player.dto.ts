import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
