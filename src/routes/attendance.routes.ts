import { Router } from 'express';
import { getAttendance, getMyAttendanceHistory, getMyCurrentAttendance, postClockIn, postClockOut } from '../controllers/attendance.controller.js';
import { requireAdmin, requireAttendanceUser, requireAuth } from '../middleware/auth.middleware.js';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.post('/clock-in', requireAttendanceUser, postClockIn);
attendanceRouter.post('/clock-out', requireAttendanceUser, postClockOut);
attendanceRouter.get('/me/current', requireAttendanceUser, getMyCurrentAttendance);
attendanceRouter.get('/me/history', requireAttendanceUser, getMyAttendanceHistory);
attendanceRouter.get('/', requireAdmin, getAttendance);
