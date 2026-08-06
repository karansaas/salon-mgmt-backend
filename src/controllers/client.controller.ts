import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { ClientGender } from '../models/Client.js';
import { ClientInput, createClient, deactivateClient, getClient, listClients, toClientResponse, updateClient } from '../services/client.service.js';
import { AppError } from '../utils/AppError.js';

const allowedSortFields = ['firstName', 'lastName', 'mobileNumber', 'createdAt', 'updatedAt'] as const;
const routeId = (value: string | string[]): string => Array.isArray(value) ? value[0] : value;

const validateClientInput = (body: unknown, requireFields: boolean): ClientInput | Partial<ClientInput> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'A valid client payload is required');
  const input = body as Record<string, unknown>;
  const output: Partial<ClientInput> = {};
  const firstName = input.firstName;
  if (requireFields && (!firstName || typeof firstName !== 'string' || !firstName.trim())) throw new AppError(400, 'firstName is required');
  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || !firstName.trim()) throw new AppError(400, 'firstName must be a non-empty string');
    output.firstName = firstName.trim();
  }
  if (input.lastName !== undefined && input.lastName !== '') {
    if (typeof input.lastName !== 'string') throw new AppError(400, 'lastName must be a string');
    output.lastName = input.lastName.trim();
  }
  if (input.mobileNumber !== undefined && input.mobileNumber !== '') {
    if (typeof input.mobileNumber !== 'string') throw new AppError(400, 'mobileNumber must be a string');
    const mobileNumber = input.mobileNumber.replace(/[\s()-]/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(mobileNumber)) throw new AppError(400, 'Please provide a valid mobile number');
    output.mobileNumber = mobileNumber;
  }
  if (input.gender !== undefined) {
    if (!['Male', 'Female', 'Other'].includes(input.gender as string)) throw new AppError(400, 'gender must be Male, Female, or Other');
    output.gender = input.gender as ClientGender;
  }
  if (input.email !== undefined && input.email !== '') {
    if (typeof input.email !== 'string' || !/^\S+@\S+\.\S+$/.test(input.email)) throw new AppError(400, 'Please provide a valid email address');
    output.email = input.email.trim().toLowerCase();
  }
  for (const field of ['address', 'notes'] as const) {
    if (input[field] !== undefined && input[field] !== '') {
      if (typeof input[field] !== 'string') throw new AppError(400, `${field} must be a string`);
      output[field] = input[field].trim();
    }
  }
  if (input.dateOfBirth !== undefined && input.dateOfBirth !== '') {
    const date = new Date(input.dateOfBirth as string);
    if (Number.isNaN(date.getTime()) || date > new Date()) throw new AppError(400, 'dateOfBirth must be a valid past date');
    output.dateOfBirth = date;
  }
  if (input.preferredEmployee !== undefined) {
    if (typeof input.preferredEmployee !== 'string' || !/^[a-f\d]{24}$/i.test(input.preferredEmployee)) throw new AppError(400, 'preferredEmployee must be a valid ID');
    output.preferredEmployee = new Types.ObjectId(input.preferredEmployee);
  }
  if (!requireFields && Object.keys(output).length === 0) throw new AppError(400, 'Provide at least one field to update');
  return output as ClientInput;
};

export const getClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string, 10) || 20));
    const sortBy = (req.query.sortBy as string | undefined) ?? 'createdAt';
    const sortOrder = (req.query.sortOrder as string | undefined) ?? 'desc';
    if (!allowedSortFields.includes(sortBy as typeof allowedSortFields[number])) throw new AppError(400, `sortBy must be one of: ${allowedSortFields.join(', ')}`);
    if (sortOrder !== 'asc' && sortOrder !== 'desc') throw new AppError(400, 'sortOrder must be asc or desc');
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    res.json(await listClients({ page, limit, search, sortBy: sortBy as typeof allowedSortFields[number], sortOrder }));
  } catch (error) { next(error); }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ client: toClientResponse(await getClient(routeId(req.params.id))) }); } catch (error) { next(error); }
};

export const getClientHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await getClient(routeId(req.params.id));
    res.json({
      visitHistory: [],
      billingHistory: [],
      servicesAvailed: [],
      productsPurchased: [],
      totalAmountSpent: 0,
      lastVisitDate: null,
      preferredEmployee: client.preferredEmployee ? client.preferredEmployee.toString() : null,
    });
  } catch (error) { next(error); }
};

export const postClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.status(201).json({ client: toClientResponse(await createClient(validateClientInput(req.body, true) as ClientInput)) }); } catch (error) { next(error); }
};

export const putClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { res.json({ client: toClientResponse(await updateClient(routeId(req.params.id), validateClientInput(req.body, false))) }); } catch (error) { next(error); }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { await deactivateClient(routeId(req.params.id)); res.json({ message: 'Client deactivated successfully' }); } catch (error) { next(error); }
};
