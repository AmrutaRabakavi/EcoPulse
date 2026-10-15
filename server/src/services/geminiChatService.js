/**
 * @file geminiChatService.js
 * @desc Service for interacting with Google Gemini API via native fetch.
 *
 * Security & Cost Protections:
 * - API key read strictly from process.env.GEMINI_API_KEY.
 * - Never prints or leaks API keys in error messages, logs, or responses.
 * - 10-second timeout via AbortController.
 * - Max output tokens capped at 500 tokens.
 * - Sanitized error handling: raw provider bodies are never passed to callers.
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.5-flash';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_OUTPUT_TOKENS = 500;

const SYSTEM_INSTRUCTION = `You are EcoPulse AI, an intelligent sustainability assistant for a green college campus.
Your mission is to provide practical, evidence-based, and encouraging sustainability advice to students, faculty, and campus visitors.

Guidelines:
1. Answer questions about recycling, energy conservation, green commuting, food waste reduction, water stewardship, and campus sustainability initiatives.
2. Provide concise, actionable, and realistic suggestions that college students can implement immediately.
3. If a question asks about specific campus facilities, dates, or institutional policies that are not provided, acknowledge uncertainty and recommend checking with the campus Sustainability Office or EcoPulse initiatives board.
4. You do NOT have access to private student records, grades, personal EcoPulse accounts, or live sensor feeds. Never claim to access, check, or modify personal user accounts.
5. Keep answers focused on sustainability and environmental stewardship. Politely decline inappropriate or completely unrelated requests.`;

let customFetchFn = null;

/**
 * Override fetch for testing without mutating globalThis.fetch
 * @param {Function|null} fn
 */
export function setGeminiFetch(fn) {
  customFetchFn = fn;
}

export function resetGeminiFetch() {
  customFetchFn = null;
}

/**
 * Format conversation history into Gemini's contents structure
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Array<{role: string, parts: Array<{text: string}>}>}
 */
export function formatGeminiContents(history = [], userMessage) {
  const contents = [];

  for (const item of history) {
    const role = item.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: item.content }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  return contents;
}

/**
 * Send a chat message to Gemini with conversation history
 * @param {string} message - User's input message
 * @param {Array<{role: string, content: string}>} [history=[]] - Validated previous messages
 * @param {Object} [options={}] - Optional overrides for testing
 * @returns {Promise<{success: boolean, reply?: string, error?: string, status?: number}>}
 */
export async function sendChatMessage(message, history = [], options = {}) {
  const apiKey = options.apiKey !== undefined ? options.apiKey : process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      status: 503,
      error: 'Sustainability chatbot service is currently not configured by the campus administrator.',
    };
  }

  const model = options.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || REQUEST_TIMEOUT_MS;
  const fetchFn = options.fetchFn || customFetchFn || globalThis.fetch;

  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: formatGeminiContents(history, message),
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          status: 429,
          error: 'AI service is currently busy handling high demand. Please try again in a few moments.',
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          status: 502,
          error: 'The configured AI model is currently unavailable. Please contact the administrator.',
        };
      }
      return {
        success: false,
        status: 502,
        error: 'The AI provider returned an unexpected error. Please try again later.',
      };
    }

    const data = await response.json();

    const candidate = data?.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart || typeof textPart !== 'string') {
      return {
        success: false,
        status: 502,
        error: 'Received an empty or unparseable response from the AI provider.',
      };
    }

    return {
      success: true,
      reply: textPart.trim(),
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 504,
        error: 'AI service request timed out. Please try asking a shorter question.',
      };
    }

    return {
      success: false,
      status: 502,
      error: 'Unable to communicate with the AI service. Please check your network connection.',
    };
  }
}
