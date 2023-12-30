import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponse } from './type/login-response';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findOneBy({
      where: { email: loginDto.email },
      relations: ['roles'],
    });
    if (!user || !user.passwordMatch(loginDto.password)) {
      throw new BadRequestException('Invalid credentials');
    }
    return {
      accessToken: await this.getAccessToken(user),
      user: user,
    };
  }
  private async getAccessToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    });
  }
}
