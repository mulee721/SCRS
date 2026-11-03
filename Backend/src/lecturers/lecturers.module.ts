import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LecturersService } from './lecturers.service';
import { LecturersController } from './lecturers.controller';
import { LecturerSchema } from './entities/lecturer.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Lecturer', schema: LecturerSchema }]),
    UsersModule,
  ],
  controllers: [LecturersController],
  providers: [LecturersService],
  exports: [LecturersService],
})
export class LecturersModule {}
