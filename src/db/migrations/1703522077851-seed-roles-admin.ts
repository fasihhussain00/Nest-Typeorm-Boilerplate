import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { PermissionEnum } from 'src/roles/entities/types';

export class SeedRolesAdmin1703522077851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    const rolesToInsert = [
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
      await queryRunner.manager.insert(Role, rolesToInsertFiltered);
    }
    await queryRunner.commitTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    await queryRunner.manager.delete(Role, { name: In(['admin', 'player']) });
    await queryRunner.commitTransaction();
  }
}
