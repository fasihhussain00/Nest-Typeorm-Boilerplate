import { CustomBaseEntity } from 'src/db/custom.base.entity';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { PermissionEnum } from './types';

@Entity()
@Index('role_name_uc', ['name'], {
  unique: true,
  where: '(deleted_at IS NULL)',
})
export class Role extends CustomBaseEntity {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'role_pk' })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', array: true, enum: PermissionEnum, default: [] })
  permissions: string[];
}
