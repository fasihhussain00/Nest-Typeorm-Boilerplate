import { PermissionEnum } from 'src/roles/entities/types';

import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';

export const PERMISSIONS_DECORATOR_KEY = 'permissions';
export function Auth(...permissions: PermissionEnum[]) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_DECORATOR_KEY, permissions),
    UseGuards(AuthGuard, PermissionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
