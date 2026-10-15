import express from 'express';
import {
  getDashboardSummary,
  getPointsHistory,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDashboardSummary);
router.get('/points/history', protect, getPointsHistory);

export default router;
