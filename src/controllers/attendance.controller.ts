import { NextFunction, Request, Response } from 'express';
import { AttendanceStatus } from '../models/Attendance.js';
import { clockIn, clockOut, currentAttendance, listAttendance, myAttendanceHistory } from '../services/attendance.service.js';
import { AppError } from '../utils/AppError.js';
import { DateRange, resolveIndiaDateRange } from '../utils/dateRange.js';

const one = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};
const pagination = (query: Request['query']) => ({
  page: Math.max(1, Number.parseInt(one(query.page) ?? '', 10) || 1),
  limit: Math.min(100, Math.max(1, Number.parseInt(one(query.limit) ?? '', 10) || 20)),
});

const dateRange = (query: Request['query'], defaultToToday: boolean): DateRange | undefined => {
  const from = one(query.from)?.trim() || undefined;
  const to = one(query.to)?.trim() || undefined;
  if (!from && !to && !defaultToToday) return undefined;
  try { return resolveIndiaDateRange(from, to); }
  catch (error) { throw new AppError(400, error instanceof Error ? error.message : 'Invalid date range'); }
};

const employeeContext = (req: Request): { employeeId: string; userId: string } => {
  if (!req.user?.employee) throw new AppError(403, 'Employee access is required');
  return { employeeId: req.user.employee.toString(), userId: req.user.id };
};

export const postClockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { employeeId, userId } = employeeContext(req); res.status(201).json({ attendance: await clockIn(employeeId, userId) }); }
  catch (error) { next(error); }
};

export const postClockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { employeeId } = employeeContext(req); res.json({ attendance: await clockOut(employeeId) }); }
  catch (error) { next(error); }
};

export const getMyCurrentAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { employeeId } = employeeContext(req); res.json(await currentAttendance(employeeId)); }
  catch (error) { next(error); }
};

export const getMyAttendanceHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { employeeId } = employeeContext(req); const { page, limit } = pagination(req.query); res.json(await myAttendanceHistory(employeeId, page, limit, dateRange(req.query, false))); }
  catch (error) { next(error); }
};

export const getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statusValue = one(req.query.status)?.trim();
    const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];
    if (statusValue && !statuses.includes(statusValue as AttendanceStatus)) throw new AppError(400, 'Invalid attendance status');
    const { page, limit } = pagination(req.query);
    res.json(await listAttendance({ employeeId: one(req.query.employeeId)?.trim() || undefined, status: statusValue as AttendanceStatus | undefined, page, limit, range: dateRange(req.query, true)! }));
  } catch (error) { next(error); }
};
