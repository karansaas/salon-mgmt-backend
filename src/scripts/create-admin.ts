import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env');
  await connectDatabase();
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) throw new Error(`A user already exists for ${ADMIN_EMAIL}`);
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'Admin' });
  console.info(`Admin account created for ${ADMIN_EMAIL}`);
  process.exit(0);
};
run().catch((error) => { console.error(error); process.exit(1); });
