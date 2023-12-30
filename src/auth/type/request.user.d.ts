import { User } from 'src/users/entities/user.entity';
import { FastifyRequest } from 'fastify';

export interface AuthFastifyRequest extends FastifyRequest {
  user: Partial<User>;
}
