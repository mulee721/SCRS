import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnnouncementDocument = HydratedDocument<Announcement>;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  authorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['all', 'students', 'lecturers', 'department', 'course'],
    default: 'all',
  })
  audience!: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  targetDepartmentId!: Types.ObjectId;

  @Prop({ default: true })
  isPublished!: boolean;

  @Prop({ default: () => new Date() })
  publishedDate!: Date;

  @Prop()
  expiryDate!: Date;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
