import bcrypt from 'bcrypt';
import { HydratedDocument, Model, Schema, model } from 'mongoose';

export type UserRole = 'Admin' | 'Staff';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods { comparePassword(candidate: string): Promise<boolean>; }
type UserModel = Model<IUser, object, UserMethods>;
export type UserDocument = HydratedDocument<IUser, UserMethods>;

const userSchema = new Schema<IUser, UserModel, UserMethods>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['Admin', 'Staff'], default: 'Staff' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
