import { PermissionEnum } from '../entities/types';
import { IsString, IsEnum } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsEnum(PermissionEnum, { each: true })
  permissions: PermissionEnum[];
}
