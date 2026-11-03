import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentSchema } from './entities/student.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Student', schema: StudentSchema }])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
