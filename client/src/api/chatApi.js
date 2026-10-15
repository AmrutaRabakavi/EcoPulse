import API from './authApi';

/**
 * Send user message and conversation history to the EcoPulse AI Chatbot backend.
 * Uses the existing authenticated Axios instance (works for guests and signed-in students).
 *
 * @param {string} message - Current user message
 * @param {Array<{role: string, content: string}>} [history=[]] - Conversation history
 * @returns {Promise<{success: boolean, reply: string}>}
 */
export const sendChatMessage = async (message, history = []) => {
  const response = await API.post('/chat', {
    message,
    history,
  });
  return response.data;
};
