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
import { Auth } from 'src/auth/decorators/permission.decorator';
import { PermissionEnum } from 'src/roles/entities/types';

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

  @Auth(PermissionEnum.USER_WRITE)
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

  @Auth(PermissionEnum.USER_READ)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Auth(PermissionEnum.USER_READ)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Auth(PermissionEnum.USER_WRITE)
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

  @Auth(PermissionEnum.USER_REMOVE)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(id);
  }
}
