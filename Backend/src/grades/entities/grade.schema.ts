import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GradeDocument = HydratedDocument<Grade>;

@Schema({ timestamps: true })
export class Grade {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Registration', unique: true })
  registrationId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  studentId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Lecturer' })
  lecturerId!: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  score!: number;

  @Prop()
  letterGrade!: string;

  @Prop()
  gradePoints!: number;

  @Prop()
  feedback!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  enteredBy!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  enteredDate!: Date;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
