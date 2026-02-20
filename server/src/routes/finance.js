const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'finance.json';

const defaultRecords = [
  { id: uuidv4(), studentId: 'STU001', type: 'tuition', description: 'Semester 5 Tuition Fee', amount: 75000, status: 'paid', paidAt: '2026-01-15', dueDate: '2026-01-31', semester: 5 },
  { id: uuidv4(), studentId: 'STU001', type: 'hostel', description: 'Hostel Fee - Block A', amount: 25000, status: 'paid', paidAt: '2026-01-15', dueDate: '2026-01-31', semester: 5 },
  { id: uuidv4(), studentId: 'STU001', type: 'library', description: 'Library Fine', amount: 250, status: 'pending', dueDate: '2026-03-01', semester: 5 },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) { await store.writeData(FILE, defaultRecords); return defaultRecords; }
  return data;
}

// GET /api/finance
router.get('/', async (req, res) => {
  await seed();
  const { studentId, type, status } = req.query;
  let data = await store.readData(FILE, []);
  if (studentId) data = data.filter((d) => d.studentId === studentId);
  if (type) data = data.filter((d) => d.type === type);
  if (status) data = data.filter((d) => d.status === status);
  res.json(data);
});

// POST /api/finance (create record)
router.post('/', async (req, res) => {
  const record = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  await store.appendData(FILE, record);
  res.status(201).json(record);
});

// PUT /api/finance/:id (mark paid, etc.)
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Record not found' });
  res.json(updated);
});

// GET /api/finance/summary
router.get('/summary', async (req, res) => {
  const data = await store.readData(FILE, []);
  const summary = {
    totalCollected: data.filter((d) => d.status === 'paid').reduce((s, d) => s + d.amount, 0),
    totalPending: data.filter((d) => d.status === 'pending').reduce((s, d) => s + d.amount, 0),
    totalRecords: data.length,
    byType: {},
  };
  data.forEach((item) => {
    if (!summary.byType[item.type]) summary.byType[item.type] = { paid: 0, pending: 0 };
    summary.byType[item.type][item.status] = (summary.byType[item.type][item.status] || 0) + item.amount;
  });
  res.json(summary);
});

module.exports = router;
