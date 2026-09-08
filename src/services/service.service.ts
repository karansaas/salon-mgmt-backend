import { FilterQuery, Types } from 'mongoose';
import { Service, ServiceDocument, IService } from '../models/Service.js';
import { Bill } from '../models/Bill.js';
import { AppError } from '../utils/AppError.js';

export type ServiceInput = Pick<IService, 'name' | 'category' | 'price'> & Partial<Pick<IService, 'duration' | 'description' | 'isActive'>>;
export type ServiceListOptions = { page: number; limit: number; search?: string; category?: string; status: 'active' | 'inactive' | 'all'; sortBy: 'name' | 'category' | 'duration' | 'price' | 'createdAt' | 'updatedAt'; sortOrder: 'asc' | 'desc'; };

export const toServiceResponse = (service: ServiceDocument) => ({ id: service.id, name: service.name, category: service.category, description: service.description, duration: service.duration, price: service.price, isActive: service.isActive, createdAt: service.createdAt, updatedAt: service.updatedAt });

export const listServices = async ({ page, limit, search, category, status, sortBy, sortOrder }: ServiceListOptions) => {
  const filter: FilterQuery<IService> = {};
  if (status !== 'all') filter.isActive = status === 'active';
  if (category) filter.category = category;
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');
  const [services, total] = await Promise.all([Service.find(filter).sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }).skip((page - 1) * limit).limit(limit), Service.countDocuments(filter)]);
  return { services: services.map(toServiceResponse), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getService = async (id: string): Promise<ServiceDocument> => { validateId(id); const service = await Service.findById(id); if (!service) throw new AppError(404, 'Service not found'); return service; };
export const getServicePerformance = async (id: string) => {
  validateId(id);
  const service = await Service.exists({ _id: id });
  if (!service) throw new AppError(404, 'Service not found');

  const [performance] = await Bill.aggregate([{ $match: { 'services.serviceId': new Types.ObjectId(id) } }, { $unwind: '$services' }, { $match: { 'services.serviceId': new Types.ObjectId(id) } }, { $group: { _id: null, timesUsed: { $sum: '$services.quantity' }, revenueGenerated: { $sum: '$services.total' }, employees: { $addToSet: '$services.employeeId' } } }, { $project: { _id: 0, timesUsed: 1, revenueGenerated: 1, employeesProvidingService: { $size: '$employees' } } }]);
  return performance ?? { timesUsed: 0, revenueGenerated: 0, employeesProvidingService: 0 };
};
export const createService = async (input: ServiceInput): Promise<ServiceDocument> => Service.create(input);
export const updateService = async (id: string, input: Partial<ServiceInput>): Promise<ServiceDocument> => { validateId(id); const service = await Service.findByIdAndUpdate(id, input, { new: true, runValidators: true }); if (!service) throw new AppError(404, 'Service not found'); return service; };
export const deactivateService = async (id: string): Promise<void> => { validateId(id); const service = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true }); if (!service) throw new AppError(404, 'Service not found'); };
const validateId = (id: string): void => { if (!Types.ObjectId.isValid(id)) throw new AppError(400, 'Invalid service ID'); };
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
