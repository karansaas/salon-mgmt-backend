import { Types } from 'mongoose';
import { Attendance, AttendanceDocument, AttendanceStatus } from '../models/Attendance.js';
import { AppError } from '../utils/AppError.js';
import { DateRange, indiaDate } from '../utils/dateRange.js';

export type AttendanceView = {
  id: string;
  employeeId: string;
  userId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  clockIn: Date;
  clockOut?: Date;
  totalMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AttendancePage = {
  attendance: AttendanceView[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const asId = (value: string, label: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) throw new AppError(400, `Invalid ${label} ID`);
  return new Types.ObjectId(value);
};

const toView = (attendance: AttendanceDocument): AttendanceView => ({
  id: attendance.id,
  employeeId: attendance.employee.toString(),
  userId: attendance.user.toString(),
  attendanceDate: attendance.attendanceDate,
  status: attendance.status,
  clockIn: attendance.clockIn,
  clockOut: attendance.clockOut,
  totalMinutes: attendance.totalMinutes,
  createdAt: attendance.createdAt,
  updatedAt: attendance.updatedAt,
});

const elapsedMinutes = (clockIn: Date, until: Date): number => Math.max(0, Math.floor((until.getTime() - clockIn.getTime()) / 60000));

export const clockIn = async (employeeId: string, userId: string): Promise<AttendanceView> => {
  const employee = asId(employeeId, 'employee');
  const user = asId(userId, 'user');
  const attendanceDate = indiaDate(new Date());
  const existing = await Attendance.findOne({ employee, attendanceDate });
  if (existing) throw new AppError(409, 'You have already clocked in for today');

  try {
    const attendance = await Attendance.create({ employee, user, attendanceDate, status: 'PRESENT', clockIn: new Date(), totalMinutes: 0 });
    return toView(attendance);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) throw new AppError(409, 'You have already clocked in for today');
    throw error;
  }
};

export const clockOut = async (employeeId: string): Promise<AttendanceView> => {
  const employee = asId(employeeId, 'employee');
  const attendanceDate = indiaDate(new Date());
  const attendance = await Attendance.findOne({ employee, attendanceDate });
  if (!attendance) throw new AppError(400, 'Clock in before clocking out');
  if (attendance.clockOut) throw new AppError(409, 'You have already clocked out for today');

  const now = new Date();
  const updated = await Attendance.findOneAndUpdate(
    { _id: attendance._id, clockOut: { $exists: false } },
    { $set: { clockOut: now, totalMinutes: elapsedMinutes(attendance.clockIn, now) } },
    { new: true },
  );
  if (!updated) throw new AppError(409, 'You have already clocked out for today');
  return toView(updated);
};

export const currentAttendance = async (employeeId: string) => {
  const employee = asId(employeeId, 'employee');
  const attendance = await Attendance.findOne({ employee, attendanceDate: indiaDate(new Date()) });
  if (!attendance) return { attendanceDate: indiaDate(new Date()), state: 'NOT_CLOCKED_IN' as const, attendance: null, elapsedMinutes: 0 };
  return {
    attendanceDate: attendance.attendanceDate,
    state: attendance.clockOut ? 'CLOCKED_OUT' as const : 'CLOCKED_IN' as const,
    attendance: toView(attendance),
    elapsedMinutes: attendance.clockOut ? attendance.totalMinutes : elapsedMinutes(attendance.clockIn, new Date()),
  };
};

const history = async (filter: Record<string, unknown>, page: number, limit: number): Promise<AttendancePage> => {
  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ attendanceDate: -1, clockIn: -1 }).skip((page - 1) * limit).limit(limit),
    Attendance.countDocuments(filter),
  ]);
  return { attendance: records.map(toView), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const myAttendanceHistory = (employeeId: string, page: number, limit: number, range?: DateRange): Promise<AttendancePage> => {
  const employee = asId(employeeId, 'employee');
  const filter: Record<string, unknown> = { employee };
  if (range) filter.attendanceDate = { $gte: range.fromDate, $lte: range.toDate };
  return history(filter, page, limit);
};

export const listAttendance = (input: { employeeId?: string; status?: AttendanceStatus; page: number; limit: number; range: DateRange }): Promise<AttendancePage> => {
  const filter: Record<string, unknown> = { attendanceDate: { $gte: input.range.fromDate, $lte: input.range.toDate } };
  if (input.employeeId) filter.employee = asId(input.employeeId, 'employee');
  if (input.status) filter.status = input.status;
  return history(filter, input.page, input.limit);
};
