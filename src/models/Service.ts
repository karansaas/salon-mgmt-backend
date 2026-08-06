import { HydratedDocument, Schema, model } from 'mongoose';
import type { ServiceCategory } from '../constants/serviceCategories.js';

export interface IService { name: string; category: ServiceCategory; description?: string; duration: number; price: number; isActive: boolean; createdAt: Date; updatedAt: Date; }
export type ServiceDocument = HydratedDocument<IService>;

const serviceSchema = new Schema<IService>({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 150 },
  category: { type: String, required: true, enum: ['Haircut', 'Hair Color', 'Hair Treatment', 'Facial', 'Makeup', 'Waxing', 'Threading', 'Manicure', 'Pedicure', 'Spa', 'Massage', 'Other'] },
  description: { type: String, trim: true, maxlength: 2000 },
  duration: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0.01 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Service = model<IService>('Service', serviceSchema);
