import { compareSync, hashSync, genSaltSync } from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  BeforeUpdate,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CustomBaseEntity } from 'src/db/custom.base.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity()
@Index('user_email_unqiue_constraint', ['email'], {
  unique: true,
  where: '(deleted_at IS NULL)',
})
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'user_pk' })
  id: number;

  @Column({ nullable: true })
  sourceId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password?: string;

  @ManyToMany(() => Role, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_role',
    inverseJoinColumn: {
      name: 'role_id',
      foreignKeyConstraintName: 'user_role_fk',
    },
    joinColumn: {
      name: 'user_id',
      foreignKeyConstraintName: 'role_user_fk',
    },
  })
  roles: Role[];

  @BeforeUpdate()
  @BeforeInsert()
  hashPassword() {
    const salt = genSaltSync();
    if (this.password) this.password = hashSync(this.password, salt);
  }

  passwordMatch(plainPassword: string) {
    if (!plainPassword || !this.password) return false;
    return compareSync(plainPassword, this.password);
  }
}
