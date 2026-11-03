import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student', index: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Course', index: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Semester' })
  semesterId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'dropped'],
    default: 'pending',
    index: true,
  })
  status!: string;

  @Prop({ default: () => new Date() })
  registrationDate!: Date;

  @Prop()
  approvalDate!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy!: Types.ObjectId;

  @Prop()
  dropDate!: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Compound index to prevent duplicate registrations
RegistrationSchema.index({ studentId: 1, courseId: 1, semesterId: 1 }, { unique: true });
