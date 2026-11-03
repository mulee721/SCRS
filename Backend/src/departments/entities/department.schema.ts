import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true, uppercase: true, index: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer' })
  headId!: Types.ObjectId;

  @Prop()
  description!: string;

  @Prop()
  phoneNumber!: string;

  @Prop()
  officeLocation!: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
