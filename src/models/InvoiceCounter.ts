import { Schema, model } from 'mongoose';

const invoiceCounterSchema = new Schema({ year: { type: Number, required: true, unique: true }, sequence: { type: Number, required: true, default: 0 } });
export const InvoiceCounter = model('InvoiceCounter', invoiceCounterSchema);
