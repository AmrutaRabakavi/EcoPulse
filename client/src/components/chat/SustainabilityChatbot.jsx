import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { sendChatMessage } from '../../api/chatApi';

const MAX_MESSAGE_LENGTH = 500;

const STARTER_QUESTIONS = [
  'How can I reduce my carbon footprint?',
  'What are easy ways to save water on campus?',
  'How can I reduce plastic waste?',
  'Where should I start with campus sustainability?',
];

/**
 * Format error message safely from Axios or network response
 */
const getErrorMessage = (err) => {
  if (err.response) {
    const status = err.response.status;
    const backendMsg = err.response.data?.message;

    if (status === 503) {
      return (
        backendMsg ||
        'The AI sustainability chatbot is currently not configured by the campus administrator.'
      );
    }
    if (status === 429) {
      return (
        backendMsg ||
        "You've sent several messages quickly. Please wait a moment before trying again."
      );
    }
    if (status === 504) {
      return 'The request timed out. Please try asking a shorter question.';
    }
    if (backendMsg && typeof backendMsg === 'string') {
      return backendMsg;
    }
  } else if (err.request) {
    return 'Unable to reach the server. Please check your network connection.';
  }
  return 'An unexpected error occurred. Please try again.';
};

const SustainabilityChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  // In-memory conversation state: Array of { id, role: 'user'|'assistant', content: string, error?: boolean }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async (messageToSend = null) => {
    const text = (messageToSend !== null ? messageToSend : inputMessage).trim();

    if (!text || loading) return;

    if (text.length > MAX_MESSAGE_LENGTH) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    // Prepare history to send to backend (only successful user and assistant messages, max recent 6)
    const validHistory = messages
      .filter((m) => !m.error)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.role === 'user' ? m.content.slice(0, MAX_MESSAGE_LENGTH) : m.content.slice(0, 4000),
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setLastFailedMessage(null);

    try {
      const data = await sendChatMessage(text, validHistory);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I am ready to help with your sustainability questions.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorText = getErrorMessage(err);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        error: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (!lastFailedMessage) return;
    // Remove the trailing error message if present
    setMessages((prev) => (prev[prev.length - 1]?.error ? prev.slice(0, -1) : prev));
    handleSend(lastFailedMessage);
  };

  const handleClearChat = () => {
    setMessages([]);
    setLastFailedMessage(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ── Expandable Chat Panel ────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="EcoPulse Sustainability Assistant"
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] h-[520px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 z-50"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-white/20 rounded-xl">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">EcoPulse Assistant</h3>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] text-emerald-100 font-medium">
                    Sustainability AI
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              /* Welcome screen with starter questions */
              <div className="space-y-4 pt-2">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Welcome to EcoPulse AI!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    I'm your campus sustainability guide. Ask me about conservation habits,
                    reducing your carbon footprint, recycling, or green student living!
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    Suggested Questions
                  </p>
                  <div className="space-y-1.5">
                    {STARTER_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(question)}
                        disabled={loading}
                        className="w-full text-left p-2.5 bg-white hover:bg-emerald-50/60 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs text-slate-700 transition flex items-center justify-between group shadow-2xs"
                      >
                        <span className="line-clamp-1">{question}</span>
                        <Send className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 flex-shrink-0 ml-2 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : msg.error
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    {msg.error && (
                      <div className="flex items-center space-x-1.5 mb-1 text-rose-600 font-semibold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Notice</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.error && lastFailedMessage && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={loading}
                        className="mt-2 inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry last question</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a sustainability question..."
                  rows={1}
                  maxLength={MAX_MESSAGE_LENGTH}
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 max-h-24 transition disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  aria-label="Send message"
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Character counter & helper */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span
                  className={
                    inputMessage.length > 450
                      ? 'text-rose-500 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {inputMessage.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          isOpen
            ? 'Close EcoPulse Sustainability Assistant'
            : 'Open EcoPulse Sustainability Assistant'
        }
        className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-600" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SustainabilityChatbot;
