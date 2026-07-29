import { User, UserDocument } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export const publicUser = (user: UserDocument) => ({
  id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive,
});

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError(401, 'Invalid email or password');
  if (!user.isActive) throw new AppError(403, 'Your account is inactive');
  return { token: signToken(user.id), user: publicUser(user) };
};
