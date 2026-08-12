import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { getReport, REPORT_TYPES, ReportType, reportCsv } from '../services/report.service.js';

const type = (value: string): ReportType => { if (!(REPORT_TYPES as readonly string[]).includes(value)) throw new AppError(404, 'Report not found'); return value as ReportType; };
const options = (req: Request) => ({ from: typeof req.query.from === 'string' ? req.query.from : undefined, to: typeof req.query.to === 'string' ? req.query.to : undefined, page: Math.max(1, Number.parseInt(req.query.page as string, 10) || 1), limit: Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string, 10) || 20)), search: typeof req.query.search === 'string' ? req.query.search.trim() : undefined });
const failure = (error: unknown) => error instanceof Error && /date/i.test(error.message) ? new AppError(400, error.message) : error;
export const getReportByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await getReport(type(String(req.params.type)), options(req))); } catch (error) { next(failure(error)); } };
export const exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const reportType = type(String(req.params.type)); const report = await getReport(reportType, { ...options(req), page: 1, limit: 100000 }); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="salon-${reportType}-report.csv"`); res.send(reportCsv(reportType, report)); } catch (error) { next(failure(error)); } };
