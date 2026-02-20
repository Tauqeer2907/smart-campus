const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'feedback.json';

// GET /api/feedback
router.get('/', async (req, res) => {
  const { type, studentId } = req.query;
  let data = await store.readData(FILE, []);
  if (type) data = data.filter((d) => d.type === type);
  if (studentId) data = data.filter((d) => d.studentId === studentId);
  res.json(data);
});

// POST /api/feedback
router.post('/', async (req, res) => {
  const feedback = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  await store.appendData(FILE, feedback);
  res.status(201).json(feedback);
});

// PUT /api/feedback/:id (admin responds)
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, {
    ...req.body,
    respondedAt: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Feedback not found' });
  res.json(updated);
});

// GET /api/feedback/analytics
router.get('/analytics', async (req, res) => {
  const data = await store.readData(FILE, []);
  const analytics = {
    total: data.length,
    pending: data.filter((d) => d.status === 'pending').length,
    resolved: data.filter((d) => d.status === 'resolved').length,
    byType: {},
    avgRating: 0,
  };

  data.forEach((item) => {
    analytics.byType[item.type] = (analytics.byType[item.type] || 0) + 1;
  });

  const rated = data.filter((d) => d.rating);
  if (rated.length > 0) {
    analytics.avgRating = (rated.reduce((sum, d) => sum + d.rating, 0) / rated.length).toFixed(1);
  }

  res.json(analytics);
});

module.exports = router;
