import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Lecturers')
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all lecturers' })
  @ApiResponse({ status: 200, description: 'Lecturers retrieved successfully' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.lecturersService.findAll(page, limit);
  }

  @Public()
  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get lecturers by department' })
  @ApiResponse({ status: 200, description: 'Lecturers retrieved successfully' })
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.lecturersService.findByDepartment(departmentId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lecturer by ID' })
  @ApiResponse({ status: 200, description: 'Lecturer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async findById(@Param('id') id: string) {
    return this.lecturersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new lecturer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Lecturer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Lecturer email already exists' })
  async create(@Body() createLecturerDto: CreateLecturerDto) {
    return this.lecturersService.create(createLecturerDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lecturer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lecturer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async update(@Param('id') id: string, @Body() createLecturerDto: CreateLecturerDto) {
    return this.lecturersService.update(id, createLecturerDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate lecturer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lecturer deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lecturer not found' })
  async delete(@Param('id') id: string) {
    return this.lecturersService.deactivate(id);
  }
}
