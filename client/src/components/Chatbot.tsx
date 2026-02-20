import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Minimize2,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'http://localhost:5000';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  suggestions?: string[];
  timestamp: string;
  fallback?: boolean;
}

export function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome',
        sender: 'bot',
        message: `Hello${user ? `, ${user.name}` : ''}! 👋 I'm **CampusAI**, your smart campus assistant. How can I help you today?`,
        suggestions: ['My attendance', 'Pending assignments', 'Active placements', 'Help'],
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, user]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: msgText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatUserId = user?.studentId || user?.rollNumber || user?.id || 'anonymous';
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          userId: chatUserId,
          role: user?.role || 'student',
          context: {
            page: window.location.hash,
            studentId: user?.studentId,
            rollNumber: user?.rollNumber,
            branch: user?.branch,
            semester: user?.semester,
            cgpa: user?.cgpa,
            name: user?.name,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: data.id || `bot-${Date.now()}`,
          sender: 'bot',
          message: data.message,
          suggestions: data.suggestions,
          timestamp: data.timestamp || new Date().toISOString(),
          fallback: data.fallback,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch {
      // Offline fallback
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        message: getOfflineFallback(msgText),
        suggestions: ['Try again', 'Help', 'My dashboard'],
        timestamp: new Date().toISOString(),
        fallback: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (user) {
      fetch(`${API_BASE}/api/chat/history?userId=${user.id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-[100] flex flex-col bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden',
              isExpanded
                ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:top-4 md:w-[500px] md:h-[calc(100vh-2rem)]'
                : 'bottom-6 right-6 w-[380px] h-[560px] max-h-[80vh]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    CampusAI
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Smart Campus Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hidden md:flex"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2.5', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-white/5 border border-white/5 rounded-bl-md'
                    )}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.message) }}
                      className="whitespace-pre-wrap"
                    />
                    {msg.fallback && (
                      <span className="text-[9px] text-yellow-400/60 mt-1 block">offline mode</span>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Suggestion chips */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-1.5 pl-9"
                >
                  {messages[messages.length - 1].suggestions!.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-background/30">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CampusAI anything..."
                  disabled={isLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 placeholder:text-muted-foreground/50"
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground/40 text-center mt-2">
                CampusAI • Smart Campus Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getOfflineFallback(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey'))
    return "Hello! 👋 I'm currently running in offline mode. The backend server isn't available, but I can still help with basic queries!";
  if (msg.includes('attendance'))
    return '📊 Check the Attendance section in the sidebar for your detailed attendance records.';
  if (msg.includes('assignment'))
    return '📝 Visit the Assignments section to view and submit your pending work.';
  if (msg.includes('placement'))
    return '💼 Head to the Placements section for active drives and application status.';
  if (msg.includes('library'))
    return '📚 The Library section lets you search for books and manage borrowings.';
  if (msg.includes('help'))
    return "🤖 I can help with attendance, assignments, placements, library, hostel, and more. The backend server is currently offline — please start it for full functionality.";
  return "I'm running in offline mode. Please ensure the backend server is running on port 5000 for full AI-powered responses.";
}

export default Chatbot;
