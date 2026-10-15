import mongoose from 'mongoose';

let memoryServerInstance = null;

/**
 * Mask credentials in MongoDB connection string for safe logging
 */
const maskUri = (rawUri) => {
  if (!rawUri) return '';
  return rawUri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
};

/**
 * Check if the URI points to a remote cluster (Atlas, external host) rather than local MongoDB
 */
const isRemoteUri = (rawUri) => {
  if (!rawUri) return false;
  if (rawUri.startsWith('mongodb+srv://')) return true;
  const isLocal = rawUri.includes('127.0.0.1') || rawUri.includes('localhost');
  return !isLocal;
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecopulse';
  const isRemote = isRemoteUri(uri);

  try {
    // Attempt standard connection to configured URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isRemote ? 5000 : 3000,
    });
    console.log(
      `[Database] MongoDB Connected: ${isRemote ? 'Atlas/Remote Cluster' : conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (err) {
    const masked = maskUri(uri);

    // If connecting to Atlas or any remote cluster, fail fast and DO NOT switch to in-memory DB
    if (isRemote) {
      console.error(`[Database Error] Failed to connect to remote MongoDB at "${masked}": ${err.message}`);
      console.error(
        '[Database Error] In-memory fallback is disabled for remote databases. Please verify your Atlas credentials and ensure your current IP address is whitelisted in Atlas Network Access.'
      );
      throw new Error(`Remote MongoDB connection failed: ${err.message}`);
    }

    console.warn(`[Database] Could not connect to local MongoDB at "${masked}": ${err.message}`);

    // For local development only, fallback to in-memory MongoDB
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();

        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB connected successfully at ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

