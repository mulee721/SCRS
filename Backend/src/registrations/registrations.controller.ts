import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Registrations')
@Controller('registrations')
@ApiBearerAuth('JWT-auth')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all registrations (Admin only)' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.registrationsService.findAll(page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Register for a course (Student)' })
  @ApiResponse({ status: 201, description: 'Course registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Cannot register - rule violation' })
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() createRegistrationDto: CreateRegistrationDto,
  ) {
    return this.registrationsService.register(
      user.refId,
      createRegistrationDto.courseId,
      createRegistrationDto.semesterId,
    );
  }

  @Get('my-registrations')
  @ApiOperation({ summary: 'Get my course registrations' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyRegistrations(
    @CurrentUser() user: JwtPayload,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.registrationsService.getStudentRegistrations(user.refId, semesterId);
  }

  @Get('my-timetable')
  @ApiOperation({ summary: 'Get my course timetable' })
  @ApiResponse({ status: 200, description: 'Timetable retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTimetable(@CurrentUser() user: JwtPayload, @Query('semesterId') semesterId: string) {
    return this.registrationsService.getStudentTimetable(user.refId, semesterId);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get students registered for a course' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCourseRegistrations(
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.registrationsService.getCourseRegistrations(courseId, page, limit);
  }

  @Get('statistics')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get registration statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(@Query('semesterId') semesterId?: string) {
    return this.registrationsService.getStatistics(semesterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration by ID' })
  @ApiResponse({ status: 200, description: 'Registration retrieved' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async findById(@Param('id') id: string) {
    return this.registrationsService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Drop course' })
  @ApiResponse({ status: 200, description: 'Course dropped successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async drop(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.registrationsService.drop(id, user.refId);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve registration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.registrationsService.approve(id, user.sub);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject registration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Registration rejected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async reject(@Param('id') id: string) {
    return this.registrationsService.reject(id);
  }
}
