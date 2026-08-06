import { HydratedDocument, Schema, Types, model } from 'mongoose';
export type StockAction = 'Purchase' | 'Adjustment' | 'Sale' | 'Initial Stock';
export interface IStockHistory { product: Types.ObjectId; action: StockAction; quantity: number; previousStock: number; newStock: number; remarks: string; createdAt: Date; updatedAt: Date; }
export type StockHistoryDocument = HydratedDocument<IStockHistory>;
const stockHistorySchema = new Schema<IStockHistory>({ product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true }, action: { type: String, enum: ['Purchase', 'Adjustment', 'Sale', 'Initial Stock'], required: true }, quantity: { type: Number, required: true }, previousStock: { type: Number, required: true }, newStock: { type: Number, required: true }, remarks: { type: String, required: true, trim: true, maxlength: 500 } }, { timestamps: true });
export const StockHistory = model<IStockHistory>('StockHistory', stockHistorySchema);
