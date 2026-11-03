import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Grades')
@Controller('grades')
@ApiBearerAuth('JWT-auth')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiOperation({ summary: 'Enter grade for student (Lecturer/Admin only)' })
  @ApiResponse({ status: 201, description: 'Grade recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid score' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async enterGrade(@Body() createGradeDto: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    return this.gradesService.enterGrade(
      createGradeDto.registrationId,
      { score: createGradeDto.score, feedback: createGradeDto.feedback },
      user.refId,
    );
  }

  @Get('my-grades')
  @ApiOperation({ summary: 'Get my course grades' })
  @ApiResponse({ status: 200, description: 'Grades retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyGrades(@CurrentUser() user: JwtPayload, @Query('semesterId') semesterId?: string) {
    return this.gradesService.getStudentGrades(user.refId, semesterId);
  }

  @Get('course/:courseId')
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiOperation({ summary: 'Get grades for a course (Lecturer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Grades retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCourseGrades(
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.gradesService.getCourseGrades(courseId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  @ApiResponse({ status: 200, description: 'Grade retrieved' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  async findById(@Param('id') id: string) {
    return this.gradesService.findById(id);
  }

  @Get('registration/:registrationId')
  @ApiOperation({ summary: 'Get grade by registration ID' })
  @ApiResponse({ status: 200, description: 'Grade retrieved' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  async findByRegistration(@Param('registrationId') registrationId: string) {
    return this.gradesService.findByRegistration(registrationId);
  }

  @Delete(':id')
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete grade (Lecturer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Grade deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  async delete(@Param('id') id: string) {
    return this.gradesService.delete(id);
  }
}
