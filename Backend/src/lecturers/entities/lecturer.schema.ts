import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LecturerDocument = HydratedDocument<Lecturer>;

@Schema({ timestamps: true })
export class Lecturer {
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

  @Prop()
  title!: string;

  @Prop()
  qualification!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  officeLocation!: string;
}

export const LecturerSchema = SchemaFactory.createForClass(Lecturer);
