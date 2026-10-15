import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import initiativeRoutes from './routes/initiativeRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import carbonRoutes from './routes/carbonRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import smartBinRoutes from './routes/smartBinRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/challenges', challengeRoutes);
// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EcoPulse / Green Campus API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/carbon-footprint', carbonRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/smart-bin', smartBinRoutes);

// Fallback & Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
