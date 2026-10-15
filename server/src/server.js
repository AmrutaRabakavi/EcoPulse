import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, async () => {
      console.log(`[EcoPulse Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

      if (
        process.env.NODE_ENV !== 'production' &&
        process.env.ECOPULSE_SEED_TEST_INITIATIVES === 'true'
      ) {
        try {
          const { seedInitiativesDev } = await import('./utils/seedInitiativesDev.js');
          await seedInitiativesDev({ port: PORT });
        } catch (seedErr) {
          console.error('[Seeder Error]', seedErr.message);
        }
      }
    });
  } catch (err) {
    console.error('[EcoPulse Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();
