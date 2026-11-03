import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SemestersService } from './semesters.service';
import { CreateSemesterDto, ChangeSemesterStatusDto } from './dto/create-semester.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Semesters')
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all semesters' })
  @ApiResponse({ status: 200, description: 'Semesters retrieved successfully' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.semestersService.findAll(page, limit);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get active semester' })
  @ApiResponse({ status: 200, description: 'Active semester retrieved' })
  @ApiResponse({ status: 404, description: 'No active semester' })
  async getActive() {
    return this.semestersService.getActive();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get semester by ID' })
  @ApiResponse({ status: 200, description: 'Semester retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async findById(@Param('id') id: string) {
    return this.semestersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new semester (Admin only)' })
  @ApiResponse({ status: 201, description: 'Semester created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semestersService.create(createSemesterDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update semester (Admin only)' })
  @ApiResponse({ status: 200, description: 'Semester updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async update(@Param('id') id: string, @Body() createSemesterDto: CreateSemesterDto) {
    return this.semestersService.update(id, createSemesterDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change semester status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Semester status changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async changeStatus(
    @Param('id') id: string,
    @Body() changeSemesterStatusDto: ChangeSemesterStatusDto,
  ) {
    return this.semestersService.changeStatus(id, changeSemesterStatusDto.status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete semester (Admin only)' })
  @ApiResponse({ status: 200, description: 'Semester deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async delete(@Param('id') id: string) {
    return this.semestersService.delete(id);
  }
}
