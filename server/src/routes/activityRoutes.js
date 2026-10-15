import express from 'express';
import {
  getStudentActivities,
  getRecentActivities,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStudentActivities);
router.get('/recent', protect, getRecentActivities);

export default router;
