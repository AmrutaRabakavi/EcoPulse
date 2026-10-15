import express from 'express';

import {
  getTodayChallenge,
  generateChallenge,
  getChallengeHistory,
  completeChallenge,
} from '../controllers/challengeController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get today's challenge.
// If today's challenge does not exist, it will be generated.
router.get('/today', protect, getTodayChallenge);

// Generate today's challenge explicitly.
router.post('/generate', protect, generateChallenge);

// Get the student's challenge history.
router.get('/', protect, getChallengeHistory);

// Complete a challenge and award its points.
router.post('/:id/complete', protect, completeChallenge);

export default router;