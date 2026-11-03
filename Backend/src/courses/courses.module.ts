import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseSchema } from './entities/course.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
