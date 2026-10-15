/**
 * @file chatRoutes.js
 * @desc Route definitions for EcoPulse sustainability chatbot.
 */

import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Public endpoint for sustainability questions
router.post('/', handleChat);

export default router;
