import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc: unknown, ret: Record<string, unknown>) {
      delete ret['password'];
      delete ret['refreshTokens'];
      delete ret['__v'];
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  username!: string;

  /** Never returned by default queries — requires explicit .select('+password') */
  @Prop({ required: true, select: false })
  password!: string;

  @Prop({
    required: true,
    enum: ['student', 'lecturer', 'admin'],
    index: true,
  })
  role!: string;

  @Prop({ required: true })
  refId!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  lastLogin!: Date;

  /** Refresh token store — never returned by default queries */
  @Prop({ type: [String], default: [], select: false })
  refreshTokens!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
