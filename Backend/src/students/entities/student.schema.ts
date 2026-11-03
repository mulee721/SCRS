import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, lowercase: true, index: true })
  email!: string;

  @Prop()
  phone!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Department' })
  departmentId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 4 })
  academicYear!: number;

  @Prop({ required: true, unique: true, index: true })
  registrationNumber!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  dateOfBirth!: Date;

  @Prop()
  address!: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
