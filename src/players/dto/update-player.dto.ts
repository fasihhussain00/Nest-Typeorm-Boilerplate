import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

export class UpdatePlayerDto extends OmitType(PartialType(CreatePlayerDto), [
  'user',
]) {
  user: UpdateUserDto;
}
