import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/permission.decorator';
import { AuthFastifyRequest } from 'src/auth/type/request.user';
import { SearchDto } from 'src/db/dto/search.dto';
import { PermissionEnum } from 'src/roles/entities/types';
import { RolesService } from 'src/roles/roles.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerDto } from './dto/register-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';

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

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('search')
  async search(@Query() searchDto: SearchDto): Promise<Player[]> {
    return await this.playersService.search(searchDto.search, searchDto.field);
  }

  @Auth(PermissionEnum.MATCH_MAKE)
  @Get('me')
  async me(@Req() req: AuthFastifyRequest): Promise<Player> {
    return await this.playersService.findOneBy({
      where: { user: { id: req.user.id } },
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
