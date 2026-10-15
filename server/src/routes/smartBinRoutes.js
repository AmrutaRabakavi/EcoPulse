import express from 'express';
import {
  getCampusBins,
  getBuildingTelemetry,
  detectWaste,
  getDepositStatus,
  claimWastePoints,
} from '../controllers/smartBinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for Kiosk / IoT bin hardware / Digital Twin
router.get('/list', getCampusBins);
router.get('/building-telemetry', getBuildingTelemetry);
router.post('/detect-waste', detectWaste);
router.get('/status/:identifier', getDepositStatus);

// Protected route for students claiming points
router.post('/claim', protect, claimWastePoints);

export default router;
