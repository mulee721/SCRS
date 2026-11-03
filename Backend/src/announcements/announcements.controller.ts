import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.announcementsService.findAll(page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  async findById(@Param('id') id: string) {
    return this.announcementsService.findById(id);
  }

  @Post()
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create announcement' })
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.announcementsService.create(createAnnouncementDto, user.sub);
  }

  @Patch(':id')
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update announcement' })
  async update(@Param('id') id: string, @Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementsService.update(id, createAnnouncementDto);
  }

  @Delete(':id')
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete announcement' })
  async delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }
}
