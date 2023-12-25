import { compareSync, hashSync, genSaltSync } from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
@Index('email_unqiue_constraint', ['email'], {
  unique: true,
  where: '(deleted_at IS NULL)',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeUpdate()
  @BeforeInsert()
  hashPassword() {
    const salt = genSaltSync();
    if (this.password) this.password = hashSync(this.password, salt);
  }

  passwordMatch(unencryptedPassword: string) {
    if (!unencryptedPassword || !this.password) return false;
    return compareSync(unencryptedPassword, this.password);
  }
}
