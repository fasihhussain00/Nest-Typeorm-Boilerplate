import { CustomBaseEntity } from 'src/db/custom.base.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('player_username_uc', ['username'], {
  unique: true,
  where: '(deleted_at IS NULL)',
})
export class Player extends CustomBaseEntity {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'player_pk' })
  id: number;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  activisionId: string;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @OneToOne(() => User, {
    cascade: true,
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'user_player_fk',
  })
  user: User;
}
