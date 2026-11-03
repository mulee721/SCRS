import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Course, CourseSchema } from '../courses/entities/course.schema';
import { Student, StudentSchema } from '../students/entities/student.schema';
import { Grade, GradeSchema } from '../grades/entities/grade.schema';
import { Department, DepartmentSchema } from '../departments/entities/department.schema';
import { Registration, RegistrationSchema } from '../registrations/entities/registration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Grade.name, schema: GradeSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
