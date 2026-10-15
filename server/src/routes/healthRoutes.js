import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoPulse Backend API',
    version: '1.0.0',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'none',
    },
    uptime: process.uptime(),
  });
});

export default router;
