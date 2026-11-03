import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('enrollment')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get enrollment report (Admin only)' })
  async getEnrollmentReport(
    @Query('semesterId') semesterId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.reportsService.getEnrollmentReport(semesterId, departmentId);
  }

  @Get('academic')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get academic performance report (Admin only)' })
  async getAcademicReport(@Query('semesterId') semesterId?: string) {
    return this.reportsService.getAcademicReport(semesterId);
  }

  @Get('departments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get department statistics report (Admin only)' })
  async getDepartmentReport(@Query('departmentId') departmentId?: string) {
    return this.reportsService.getDepartmentReport(departmentId);
  }

  @Get('course/:courseId')
  @Roles(Role.LECTURER, Role.ADMIN)
  @ApiOperation({ summary: 'Get course performance report' })
  async getCoursePerformanceReport(@Param('courseId') courseId: string) {
    return this.reportsService.getCoursePerformanceReport(courseId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student performance report' })
  async getStudentPerformanceReport(@Param('studentId') studentId: string) {
    return this.reportsService.getStudentPerformanceReport(studentId);
  }

  @Get('my-performance')
  @ApiOperation({ summary: 'Get my performance report' })
  async getMyPerformanceReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getStudentPerformanceReport(user.refId);
  }
}
