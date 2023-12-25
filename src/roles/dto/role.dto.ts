import { CreateRoleDto } from './create-role.dto';

export class RoleDto extends CreateRoleDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
