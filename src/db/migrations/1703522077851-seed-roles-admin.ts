import { DeepPartial, In, MigrationInterface, QueryRunner } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { PermissionEnum } from 'src/roles/entities/types';
import { User } from 'src/users/entities/user.entity';
import { env } from 'src/env';
import { genSalt, hash } from 'bcrypt';

export class SeedRolesAdmin1703522077851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    const rolesToInsert: DeepPartial<Role>[] = [
      {
        name: 'admin',
        permissions: [
          PermissionEnum.MATCH_MAKE,
          PermissionEnum.MATCH_MANAGE,
          PermissionEnum.ROLE_DELETE,
          PermissionEnum.ROLE_WRITE,
          PermissionEnum.ROLE_READ,
          PermissionEnum.USER_READ,
          PermissionEnum.USER_WRITE,
          PermissionEnum.USER_REMOVE,
        ],
      },
      {
        name: 'player',
        permissions: [PermissionEnum.MATCH_MAKE],
      },
    ];

    const existingRoles = await queryRunner.manager.find(Role, {
      where: { name: In(rolesToInsert.map((role) => role.name)) },
    });

    const rolesToInsertFiltered = rolesToInsert.filter(
      (role) =>
        !existingRoles.some((existingRole) => existingRole.name === role.name),
    );

    if (rolesToInsertFiltered.length > 0) {
      await queryRunner.manager.save(Role, rolesToInsertFiltered);
    }
    const usersToInsert: DeepPartial<User>[] = [
      {
        name: env.INITIAL_ADMIN_NAME,
        email: env.INITIAL_ADMIN_EMAIL,
        password: await hash(env.INITIAL_ADMIN_PASS, await genSalt()),
        roles: await queryRunner.manager.find(Role, {where: {name: In(['admin'])}})
      },
    ];
    const existingUsers = await queryRunner.manager.find(User, {
      where: { email: In(usersToInsert.map((user) => user.email)) },
    });

    const usersToInsertFiltered = usersToInsert.filter(
      (user) =>
        !existingUsers.some((existingUser) => existingUser.email === user.email),
    );

    if (usersToInsertFiltered.length > 0) {
      await queryRunner.manager.save(User, usersToInsertFiltered);
    }
    await queryRunner.commitTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    await queryRunner.manager.delete(Role, { name: In(['admin', 'player']) });
    await queryRunner.manager.delete(User, { email: In([env.INITIAL_ADMIN_EMAIL]) });
    await queryRunner.commitTransaction();
  }
}
