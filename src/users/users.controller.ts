import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/roles/entities/role.entity';
import { PlayerDto } from './dto/player.dto';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly roleService: RolesService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { success, roles } = await this.roleService.mustFind(
      createUserDto.roles || [],
    );
    if (!success) {
      throw new BadRequestException(
        { message: 'some roles in this payload are not enabled by admin' },
        'some roles in this payload are not enabled by admin',
      );
    }
    return await this.usersService.create({
      ...createUserDto,
      roles: roles,
    });
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    let roles: Role[];
    if (updateUserDto?.roles && updateUserDto.roles.length > 0) {
      const { success, ...result } = await this.roleService.mustFind(
        updateUserDto.roles,
      );
      if (!success) {
        throw new BadRequestException(
          { message: 'some roles in this payload are not enabled by admin' },
          'some roles in this payload are not enabled by admin',
        );
      }
      roles = result.roles;
    }
    if (roles) {
      return await this.usersService.update(id, {
        ...updateUserDto,
        roles: roles,
      });
    }
    return await this.usersService.update(id, updateUserDto as Role);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(id);
  }

  @Post('player')
  async registerPlayer(@Body() playerDto: PlayerDto): Promise<User> {
    const role = await this.roleService.findOneBy({ name: 'player' });
    if (!role)
      throw new BadRequestException(
        { message: 'This api is not enabled by admin yet' },
        'This api is not enabled by admin yet',
      );
    return await this.usersService.create({ ...playerDto, roles: [role] });
  }
}
