import { Router } from 'express';
import { getAttendance, getMyAttendanceHistory, getMyCurrentAttendance, postClockIn, postClockOut } from '../controllers/attendance.controller.js';
import { requireAdmin, requireAuth, requireEmployee } from '../middleware/auth.middleware.js';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.post('/clock-in', requireEmployee, postClockIn);
attendanceRouter.post('/clock-out', requireEmployee, postClockOut);
attendanceRouter.get('/me/current', requireEmployee, getMyCurrentAttendance);
attendanceRouter.get('/me/history', requireEmployee, getMyAttendanceHistory);
attendanceRouter.get('/', requireAdmin, getAttendance);
