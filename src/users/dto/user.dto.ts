import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
export class UserDto extends OmitType(CreateUserDto, ['password']) {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
