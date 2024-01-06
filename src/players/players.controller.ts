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
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerDto } from './dto/register-player.dto';
import { Player } from './entities/player.entity';
import { RolesService } from 'src/roles/roles.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Players')
@Controller({
  path: 'players',
  version: '1',
})
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly roleService: RolesService,
  ) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    const roles = await Promise.all(
      createPlayerDto.user.roles.map((role) => this.roleService.findOne(role)),
    );
    return await this.playersService.create({
      ...createPlayerDto,
      user: { ...createPlayerDto.user, roles: roles },
    });
  }

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    const roles = await Promise.all(
      updatePlayerDto.user.roles.map((role) => this.roleService.findOne(role)),
    );
    return await this.playersService.update(+id, {
      ...updatePlayerDto,
      user: {
        ...updatePlayerDto.user,
        roles: roles,
      },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(+id);
  }
  @Post('register')
  async registerPlayer(@Body() playerDto: PlayerDto): Promise<Player> {
    const role = await this.findRoleOrThrow('player');
    return await this.playersService.create({
      activisionId: playerDto.activisionId,
      username: playerDto.username,
      user: {
        name: playerDto.name,
        email: playerDto.email,
        password: playerDto.password,
        roles: [role],
      },
    });
  }
  private async findRoleOrThrow(name: string) {
    const role = await this.roleService.findOneBy({ name });
    if (!role)
      throw new BadRequestException(
        { message: 'This api is not enabled by admin yet' },
        'This api is not enabled by admin yet',
      );
    return role;
  }
}
