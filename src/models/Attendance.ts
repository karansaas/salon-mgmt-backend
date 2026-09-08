import { HydratedDocument, Schema, Types, model } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export interface IAttendance {
  employee: Types.ObjectId;
  user: Types.ObjectId;
  attendanceDate: string;
  status: AttendanceStatus;
  clockIn: Date;
  clockOut?: Date;
  totalMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceDocument = HydratedDocument<IAttendance>;

const attendanceSchema = new Schema<IAttendance>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attendanceDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'], default: 'PRESENT' },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  totalMinutes: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });
attendanceSchema.index({ attendanceDate: -1, employee: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
