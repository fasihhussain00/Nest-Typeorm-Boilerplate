import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_DECORATOR_KEY } from 'src/auth/decorators/permission.decorator';
import { AuthFastifyRequest } from '../type/request.user';
import { PermissionEnum } from 'src/roles/entities/types';
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedPermissions = this.reflector.getAllAndOverride<
      PermissionEnum[]
    >(PERMISSIONS_DECORATOR_KEY, [context.getHandler(), context.getClass()]);
    if (!expectedPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthFastifyRequest>();
    const user = request.user;
    const userPermission = user.roles.flatMap((role) => role.permissions);
    return expectedPermissions.every((expectedPermission) =>
      userPermission.includes(expectedPermission),
    );
  }
}
