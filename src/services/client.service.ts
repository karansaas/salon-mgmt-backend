import { FilterQuery, Types } from 'mongoose';
import { Client, ClientDocument, IClient } from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

export type ClientInput = Pick<IClient, 'firstName'> & Partial<Pick<IClient, 'lastName' | 'mobileNumber' | 'gender' | 'dateOfBirth' | 'email' | 'address' | 'notes' | 'preferredEmployee'>>;

export type ClientListOptions = { page: number; limit: number; search?: string; sortBy: 'firstName' | 'lastName' | 'mobileNumber' | 'createdAt' | 'updatedAt'; sortOrder: 'asc' | 'desc'; };

export const toClientResponse = (client: ClientDocument) => ({
  id: client.id,
  firstName: client.firstName,
  lastName: client.lastName,
  mobileNumber: client.mobileNumber,
  gender: client.gender,
  dateOfBirth: client.dateOfBirth,
  email: client.email,
  address: client.address,
  notes: client.notes,
  preferredEmployee: client.preferredEmployee,
  isActive: client.isActive,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

export const listClients = async ({ page, limit, search, sortBy, sortOrder }: ClientListOptions) => {
  const filter: FilterQuery<IClient> = { isActive: true };
  if (search) {
    const expression = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ firstName: expression }, { lastName: expression }, { mobileNumber: expression }];
  }
  const [clients, total] = await Promise.all([
    Client.find(filter).sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }).skip((page - 1) * limit).limit(limit),
    Client.countDocuments(filter),
  ]);
  return { clients: clients.map(toClientResponse), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getClient = async (id: string): Promise<ClientDocument> => {
  validateId(id);
  const client = await Client.findOne({ _id: id, isActive: true });
  if (!client) throw new AppError(404, 'Client not found');
  return client;
};

export const createClient = async (input: ClientInput): Promise<ClientDocument> => Client.create(input);

export const updateClient = async (id: string, input: Partial<ClientInput>): Promise<ClientDocument> => {
  validateId(id);
  const client = await Client.findOneAndUpdate({ _id: id, isActive: true }, input, { new: true, runValidators: true });
  if (!client) throw new AppError(404, 'Client not found');
  return client;
};

export const deactivateClient = async (id: string): Promise<void> => {
  validateId(id);
  const client = await Client.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true });
  if (!client) throw new AppError(404, 'Client not found');
};

const validateId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, 'Invalid client ID');
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
