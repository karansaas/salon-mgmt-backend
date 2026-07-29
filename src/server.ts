import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => console.info(`API listening on port ${env.port}`));
};

start().catch((error) => { console.error('Failed to start server', error); process.exit(1); });
