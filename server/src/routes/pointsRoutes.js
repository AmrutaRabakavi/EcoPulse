import express from 'express';
import { getPointsHistory } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', protect, getPointsHistory);

export default router;
