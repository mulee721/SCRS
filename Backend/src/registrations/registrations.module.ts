import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { RegistrationSchema } from './entities/registration.schema';
import { RegistrationValidator } from './validators/registration.validator';
import { CoursesModule } from '../courses/courses.module';
import { CourseSchema } from '../courses/entities/course.schema';
import { SemesterSchema } from '../semesters/entities/semester.schema';
import { StudentSchema } from '../students/entities/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Registration', schema: RegistrationSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Semester', schema: SemesterSchema },
      { name: 'Student', schema: StudentSchema },
    ]),
    CoursesModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationValidator],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
