import express from 'express';
import {
  getInitiatives,
  getInitiativeById,
  joinInitiative,
  leaveInitiative,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  verifyInitiativeCompletion,
  getCampusImpactMetrics,
} from '../controllers/initiativeController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated student routes
router.get('/', protect, getInitiatives);
router.get('/metrics', protect, getCampusImpactMetrics);
router.get('/impact', protect, getCampusImpactMetrics);
router.get('/:id', protect, getInitiativeById);
router.post('/:id/join', protect, joinInitiative);
router.post('/:id/leave', protect, leaveInitiative);

// Admin-only routes
router.post('/', protect, requireAdmin, createInitiative);
router.post('/:id/verify', protect, requireAdmin, verifyInitiativeCompletion);
router.patch('/:id', protect, requireAdmin, updateInitiative);
router.delete('/:id', protect, requireAdmin, deleteInitiative);

export default router;
