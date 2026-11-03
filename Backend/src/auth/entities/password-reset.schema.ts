import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PasswordResetDocument = HydratedDocument<PasswordReset>;

@Schema({ timestamps: true })
export class PasswordReset {
  @Prop({ required: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true })
  code!: string;          // 6-digit hashed code

  @Prop({ required: true })
  expiresAt!: Date;       // 10 minutes from creation

  @Prop({ default: false })
  used!: boolean;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
// Auto-delete docs 1 hour after expiresAt
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
