/**
 * @file chatController.js
 * @desc Controller for handling sustainability chatbot requests with input validation,
 *       in-memory IP rate limiting, and sanitized responses.
 */

import { sendChatMessage } from '../services/geminiChatService.js';

const MAX_MESSAGE_LENGTH = 500;
const MAX_ASSISTANT_HISTORY_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 6;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limiting map: ip -> { count, resetTime }
const ipRateLimits = new Map();

/**
 * Reset rate limit cache (useful for testing)
 */
export function resetRateLimits() {
  ipRateLimits.clear();
}

/**
 * Check and record an incoming request against the IP rate limit
 * @param {string} ip
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

/**
 * Clean up expired rate limit entries periodically (avoids memory growth)
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateLimits.entries()) {
    if (now > entry.resetTime) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Extract client IP without blindly trusting forged headers
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * @desc    Process sustainability chat message
 * @route   POST /api/chat
 * @access  Public (guests and authenticated students/faculty)
 */
export async function handleChat(req, res) {
  // 1. IP Rate Limiting
  const clientIp = getClientIp(req);
  const rateLimitStatus = checkRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      success: false,
      message: 'Too many chat requests. Please wait a minute before sending another message.',
    });
  }

  // 2. Validate user message
  const { message, history } = req.body || {};

  if (message === undefined || message === null) {
    return res.status(400).json({
      success: false,
      message: 'Message is required.',
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Message must be a string.',
    });
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty.',
    });
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  // 3. Validate conversation history if provided
  let validatedHistory = [];

  if (history !== undefined && history !== null) {
    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: 'History must be an array of messages.',
      });
    }

    // Limit to the most recent 6 messages
    const recentHistory = history.slice(-MAX_HISTORY_ITEMS);

    for (const item of recentHistory) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Each history entry must be an object with role and content.',
        });
      }

      const { role, content } = item;

      if (role !== 'user' && role !== 'assistant') {
        return res.status(400).json({
          success: false,
          message: "Invalid history role. Allowed roles are 'user' and 'assistant'.",
        });
      }

      if (typeof content !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'History message content must be a string.',
        });
      }

      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return res.status(400).json({
          success: false,
          message: 'History message content cannot be empty.',
        });
      }

      const maxAllowedLength =
        role === 'assistant' ? MAX_ASSISTANT_HISTORY_LENGTH : MAX_MESSAGE_LENGTH;

      if (trimmedContent.length > maxAllowedLength) {
        return res.status(400).json({
          success: false,
          message: `${role === 'assistant' ? 'Assistant' : 'User'} history message cannot exceed ${maxAllowedLength} characters.`,
        });
      }

      validatedHistory.push({
        role,
        content: trimmedContent,
      });
    }
  }

  // 4. Send message to AI service
  try {
    const result = await sendChatMessage(trimmedMessage, validatedHistory);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.error || 'Failed to process AI response.',
      });
    }

    return res.status(200).json({
      success: true,
      reply: result.reply,
    });
  } catch (err) {
    // Sanitized catch-all: never leak internal stack traces or API keys
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while communicating with the AI service.',
    });
  }
}
