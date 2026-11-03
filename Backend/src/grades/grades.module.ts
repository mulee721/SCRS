import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradeSchema } from './entities/grade.schema';
import { RegistrationSchema } from '../registrations/entities/registration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Grade', schema: GradeSchema },
      { name: 'Registration', schema: RegistrationSchema },
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
