import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

export class Slot {
  @Prop({ enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] })
  day!: string;

  @Prop({ required: true, min: 0, max: 23 })
  startTime!: number;

  @Prop({ required: true, min: 0, max: 23 })
  endTime!: number;

  @Prop()
  room!: string;
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true, uppercase: true, index: true })
  code!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ required: true, min: 1, max: 4 })
  credits!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Department' })
  departmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester', required: true })
  semesterId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer' })
  lecturerId!: Types.ObjectId;

  @Prop({ required: true })
  capacity!: number;

  @Prop({ default: 0 })
  enrolled!: number;

  @Prop({ type: [Object], default: [] })
  slots!: Slot[];

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  prerequisites!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
