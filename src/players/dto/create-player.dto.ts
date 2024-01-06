import { IsObject, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreatePlayerDto {
  @IsString()
  username: string;

  @IsString()
  activisionId: string;

  @IsObject()
  user: CreateUserDto;
}
