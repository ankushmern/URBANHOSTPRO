import mongoose from 'mongoose';
import { config } from './env';

let isMongoConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost.');
      isMongoConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB connection re-established.');
      isMongoConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    const mongoUri = config.mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookmantra';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isMongoConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    isMongoConnected = false;
    return false;
  }
};

export const getMongoStatus = () => ({
  isConnected: isMongoConnected,
  readyState: mongoose.connection.readyState,
  host: isMongoConnected ? mongoose.connection.host : 'Disconnected',
});
