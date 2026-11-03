import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SemestersService } from './semesters.service';
import { SemestersController } from './semesters.controller';
import { SemesterSchema } from './entities/semester.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Semester', schema: SemesterSchema }])],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}
