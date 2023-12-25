import { User } from 'src/users/entities/user.entity';

export class LoginResponse {
  accessToken: string;
  user: User;
}
