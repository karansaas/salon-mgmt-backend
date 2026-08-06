import { HydratedDocument, Schema, Types, model } from 'mongoose';

export type ClientGender = 'Male' | 'Female' | 'Other';

export interface IClient {
  firstName: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: ClientGender;
  dateOfBirth?: Date;
  email?: string;
  address?: string;
  notes?: string;
  preferredEmployee?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientDocument = HydratedDocument<IClient>;

const clientSchema = new Schema<IClient>({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, trim: true, maxlength: 100 },
  mobileNumber: { type: String, unique: true, sparse: true, trim: true, match: /^\+?[1-9]\d{7,14}$/ },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  email: { type: String, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  address: { type: String, trim: true, maxlength: 500 },
  notes: { type: String, trim: true, maxlength: 2000 },
  preferredEmployee: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Client = model<IClient>('Client', clientSchema);
