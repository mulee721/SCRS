import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    required: true,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info',
  })
  type!: string;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop()
  actionUrl!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index for quick queries of unread notifications
NotificationSchema.index({ userId: 1, isRead: 1 });
