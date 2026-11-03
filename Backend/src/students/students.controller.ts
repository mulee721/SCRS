import { Controller, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all students (Admin only)' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('departmentId') departmentId?: string,
  ) {
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;

    return this.studentsService.findAll(page, limit, filter);
  }

  @Get('my-profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my student profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.studentsService.findById(user.refId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findById(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Patch('my-profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMyProfile(@CurrentUser() user: JwtPayload, @Body() updateData: any) {
    return this.studentsService.update(user.refId, updateData);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update student (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.studentsService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate student (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async delete(@Param('id') id: string) {
    return this.studentsService.deactivate(id);
  }
}
