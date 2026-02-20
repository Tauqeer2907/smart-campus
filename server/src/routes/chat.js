const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const store = require('../utils/store');

const CHAT_FILE = 'chat_history.json';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/chat - Send message to AI chatbot
router.post('/', async (req, res) => {
  const { message, userId, role, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Store user message
  const userMsg = {
    id: uuidv4(),
    userId: userId || 'anonymous',
    role: role || 'student',
    sender: 'user',
    message,
    context: context || {},
    timestamp: new Date().toISOString(),
  };
  await store.appendData(CHAT_FILE, userMsg);

  try {
    // Forward to Python AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
      message,
      userId,
      role,
      context,
    }, { timeout: 30000 });

    const botMsg = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      role: role || 'student',
      sender: 'bot',
      message: aiResponse.data.response,
      suggestions: aiResponse.data.suggestions || [],
      timestamp: new Date().toISOString(),
    };
    await store.appendData(CHAT_FILE, botMsg);

    res.json(botMsg);
  } catch (error) {
    console.error('AI Service error:', error.message);

    // Fallback response when AI service is unavailable
    const fallbackResponse = getFallbackResponse(message, role);
    const botMsg = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      role: role || 'student',
      sender: 'bot',
      message: fallbackResponse.response,
      suggestions: fallbackResponse.suggestions,
      timestamp: new Date().toISOString(),
      fallback: true,
    };
    await store.appendData(CHAT_FILE, botMsg);

    res.json(botMsg);
  }
});

// GET /api/chat/history?userId=xxx
router.get('/history', async (req, res) => {
  const { userId, limit = 50 } = req.query;
  let data = await store.readData(CHAT_FILE, []);
  if (userId) data = data.filter((d) => d.userId === userId);
  data = data.slice(-parseInt(limit));
  res.json(data);
});

// DELETE /api/chat/history?userId=xxx
router.delete('/history', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  let data = await store.readData(CHAT_FILE, []);
  data = data.filter((d) => d.userId !== userId);
  await store.writeData(CHAT_FILE, data);
  res.json({ message: 'Chat history cleared' });
});

/**
 * Fallback responses when the Python AI service is not running.
 * Provides helpful campus-specific responses.
 */
function getFallbackResponse(message, role) {
  const msg = message.toLowerCase();

  if (msg.includes('attendance')) {
    return {
      response: 'You can check your attendance details in the Attendance section. If your attendance is below 75%, you may face detention. Would you like me to help you calculate how many classes you need to attend?',
      suggestions: ['Show my attendance', 'Calculate required classes', 'Attendance policy'],
    };
  }
  if (msg.includes('assignment') || msg.includes('homework')) {
    return {
      response: 'You can view and submit assignments in the Assignments section. Make sure to check deadlines and submit before the due date to avoid penalties.',
      suggestions: ['Pending assignments', 'Submit assignment', 'Assignment deadlines'],
    };
  }
  if (msg.includes('placement') || msg.includes('job') || msg.includes('intern')) {
    return {
      response: 'Check out the Placements section for active drives. Make sure your profile and resume are updated. Companies like Google, Microsoft, and Amazon have upcoming drives!',
      suggestions: ['Active drives', 'Update resume', 'Placement statistics'],
    };
  }
  if (msg.includes('library') || msg.includes('book')) {
    return {
      response: 'The library section lets you search for books, check availability, and borrow/return books. Library is open from 8 AM to 10 PM on weekdays.',
      suggestions: ['Search books', 'My borrowed books', 'Library timings'],
    };
  }
  if (msg.includes('hostel') || msg.includes('room')) {
    return {
      response: 'You can view your hostel details, room allocation, and raise complaints in the Hostel section. For maintenance requests, use the complaint form.',
      suggestions: ['My room details', 'Raise complaint', 'Hostel rules'],
    };
  }
  if (msg.includes('fee') || msg.includes('payment') || msg.includes('finance')) {
    return {
      response: 'Check the Finance section for fee details and payment status. You can view pending dues and payment history.',
      suggestions: ['Pending fees', 'Payment history', 'Fee structure'],
    };
  }
  if (msg.includes('grade') || msg.includes('cgpa') || msg.includes('result')) {
    return {
      response: 'Your academic performance and grades are available in the Academics section. Your CGPA and semester-wise performance are tracked there.',
      suggestions: ['View grades', 'CGPA calculator', 'Semester results'],
    };
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return {
      response: `Hello! 👋 I'm CampusAI, your smart campus assistant. I can help you with attendance, assignments, placements, library, hostel, finances, and more. What would you like to know?`,
      suggestions: ['My attendance', 'Pending assignments', 'Active placements'],
    };
  }
  if (msg.includes('help')) {
    return {
      response: `I can assist you with:\n• 📊 Attendance tracking & predictions\n• 📝 Assignment management\n• 💼 Placement drives & applications\n• 📚 Library search & borrowing\n• 🏠 Hostel & room management\n• 💰 Fee payments & finance\n• 📈 Academic performance\n\nJust ask me anything!`,
      suggestions: ['Attendance help', 'Assignment help', 'Placement help'],
    };
  }

  return {
    response: `I understand you're asking about "${message}". I'm CampusAI, and I can help with attendance, assignments, placements, library, hostel, and more. Could you be more specific about what you need?`,
    suggestions: ['What can you do?', 'My dashboard', 'Help'],
  };
}

module.exports = router;
