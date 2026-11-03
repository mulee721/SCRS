import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SemesterDocument = HydratedDocument<Semester>;

@Schema({ timestamps: true })
export class Semester {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  registrationOpenDate!: Date;

  @Prop({ required: true })
  registrationCloseDate!: Date;

  @Prop({
    required: true,
    enum: ['upcoming', 'active', 'closed'],
    default: 'upcoming',
    index: true,
  })
  status!: string;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);
