import { connectDatabase } from '../config/database.js';
import { Client } from '../models/Client.js';

const run = async () => {
  await connectDatabase();
  const collection = Client.collection;
  const existingIndex = (await collection.indexes()).find((index) => index.name === 'mobileNumber_1');
  if (existingIndex && !existingIndex.sparse) {
    await collection.dropIndex('mobileNumber_1');
    console.info('Removed the previous mobile number index');
  }
  await collection.createIndex({ mobileNumber: 1 }, { name: 'mobileNumber_1', unique: true, sparse: true });
  console.info('Created the optional unique mobile number index');
  process.exit(0);
};

run().catch((error) => { console.error(error); process.exit(1); });
