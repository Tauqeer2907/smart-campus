const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const STORAGE_MODE = (process.env.STORAGE_MODE || 'local').toLowerCase();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Ensure data directory exists (still needed for local fallback / uploads)
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/placements', require('./routes/placements'));
app.use('/api/placement', require('./routes/placementRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/hostel', require('./routes/hostel'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/grading', require('./routes/gradingRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), storage: STORAGE_MODE });
});

// Start server (connect to MongoDB first if needed)
async function start() {
  if (STORAGE_MODE === 'mongodb') {
    const { connectDB } = require('./utils/db');
    await connectDB();
  }

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Smart Campus Server running on http://localhost:${PORT}`);
    console.log(`📁 Storage mode: ${STORAGE_MODE.toUpperCase()}${STORAGE_MODE === 'mongodb' ? ' (MongoDB Atlas)' : ' (JSON files in /data)'}`);
    console.log(`🤖 AI Service expected at: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
