import { NextFunction, Request, Response } from 'express';
import { SERVICE_CATEGORIES, type ServiceCategory } from '../constants/serviceCategories.js';
import { ServiceInput, createService, deactivateService, getService, listServices, toServiceResponse, updateService } from '../services/service.service.js';
import { AppError } from '../utils/AppError.js';

const sortFields = ['name', 'category', 'duration', 'price', 'createdAt', 'updatedAt'] as const;
const routeId = (value: string | string[]): string => Array.isArray(value) ? value[0] : value;
const isCategory = (value: unknown): value is ServiceCategory => typeof value === 'string' && (SERVICE_CATEGORIES as readonly string[]).includes(value);

const parseService = (body: unknown, required: boolean): ServiceInput | Partial<ServiceInput> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'A valid service payload is required');
  const input = body as Record<string, unknown>; const output: Partial<ServiceInput> = {};
  if (required && (typeof input.name !== 'string' || !input.name.trim())) throw new AppError(400, 'name is required');
  if (input.name !== undefined) { if (typeof input.name !== 'string' || !input.name.trim()) throw new AppError(400, 'name must be a non-empty string'); output.name = input.name.trim(); }
  if (required && !isCategory(input.category)) throw new AppError(400, `category is required and must be one of: ${SERVICE_CATEGORIES.join(', ')}`);
  if (input.category !== undefined) { if (!isCategory(input.category)) throw new AppError(400, `category must be one of: ${SERVICE_CATEGORIES.join(', ')}`); output.category = input.category; }
  if (input.duration !== undefined) { const duration = Number(input.duration); if (!Number.isFinite(duration) || duration < 0) throw new AppError(400, 'duration must be zero or greater'); output.duration = duration; } else if (required) output.duration = 0;
  if (required && input.price === undefined) throw new AppError(400, 'price is required'); if (input.price !== undefined) { const price = Number(input.price); if (!Number.isFinite(price) || price <= 0) throw new AppError(400, 'price must be greater than zero'); output.price = price; }
  if (input.description !== undefined) { if (typeof input.description !== 'string') throw new AppError(400, 'description must be a string'); output.description = input.description.trim(); }
  if (input.isActive !== undefined) { if (typeof input.isActive !== 'boolean') throw new AppError(400, 'isActive must be true or false'); output.isActive = input.isActive; }
  if (!required && Object.keys(output).length === 0) throw new AppError(400, 'Provide at least one field to update');
  return output as ServiceInput;
};

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const page = Math.max(1, Number.parseInt(req.query.page as string, 10) || 1); const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string, 10) || 20)); const sortBy = (req.query.sortBy as string | undefined) ?? 'createdAt'; const sortOrder = (req.query.sortOrder as string | undefined) ?? 'desc'; const status = (req.query.status as string | undefined) ?? 'active'; const category = typeof req.query.category === 'string' && req.query.category ? req.query.category : undefined; if (!sortFields.includes(sortBy as typeof sortFields[number])) throw new AppError(400, `sortBy must be one of: ${sortFields.join(', ')}`); if (sortOrder !== 'asc' && sortOrder !== 'desc') throw new AppError(400, 'sortOrder must be asc or desc'); if (!['active', 'inactive', 'all'].includes(status)) throw new AppError(400, 'status must be active, inactive, or all'); if (category && !isCategory(category)) throw new AppError(400, `category must be one of: ${SERVICE_CATEGORIES.join(', ')}`); const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined; res.json(await listServices({ page, limit, search, category, status: status as 'active' | 'inactive' | 'all', sortBy: sortBy as typeof sortFields[number], sortOrder })); } catch (error) { next(error); } };
export const getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json({ service: toServiceResponse(await getService(routeId(req.params.id))) }); } catch (error) { next(error); } };
export const postService = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json({ service: toServiceResponse(await createService(parseService(req.body, true) as ServiceInput)) }); } catch (error) { next(error); } };
export const putService = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json({ service: toServiceResponse(await updateService(routeId(req.params.id), parseService(req.body, false))) }); } catch (error) { next(error); } };
export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await deactivateService(routeId(req.params.id)); res.json({ message: 'Service deactivated successfully' }); } catch (error) { next(error); } };
