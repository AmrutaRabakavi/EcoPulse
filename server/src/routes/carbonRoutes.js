import express from 'express';
import {
  calculateAndSaveFootprint,
  getCurrentFootprint,
  getFootprintHistory,
  getFootprintById,
} from '../controllers/carbonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/calculate', protect, calculateAndSaveFootprint);
router.get('/current', protect, getCurrentFootprint);
router.get('/history', protect, getFootprintHistory);
router.get('/:id', protect, getFootprintById);

export default router;
