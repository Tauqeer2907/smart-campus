const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'placements.json';

const defaultDrives = [
  { id: uuidv4(), company: 'Google', role: 'Software Engineer', ctc: '₹45 LPA', cutoffCgpa: 8.0, deadline: '2026-04-01', applicants: 120, status: 'open', logo: '' },
  { id: uuidv4(), company: 'Microsoft', role: 'SDE-1', ctc: '₹42 LPA', cutoffCgpa: 7.5, deadline: '2026-03-25', applicants: 95, status: 'open', logo: '' },
  { id: uuidv4(), company: 'Amazon', role: 'SDE Intern', ctc: '₹35 LPA', cutoffCgpa: 7.0, deadline: '2026-03-20', applicants: 150, status: 'open', logo: '' },
  { id: uuidv4(), company: 'TCS', role: 'System Engineer', ctc: '₹7 LPA', cutoffCgpa: 6.0, deadline: '2026-03-15', applicants: 300, status: 'open', logo: '' },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) { await store.writeData(FILE, defaultDrives); return defaultDrives; }
  return data;
}

// GET /api/placements
router.get('/', async (req, res) => {
  await seed();
  const { status } = req.query;
  let data = await store.readData(FILE, []);
  if (status) data = data.filter((d) => d.status === status);
  res.json(data);
});

// POST /api/placements (admin creates drive)
router.post('/', async (req, res) => {
  const drive = { id: uuidv4(), ...req.body, applicants: 0, createdAt: new Date().toISOString() };
  await store.appendData(FILE, drive);
  res.status(201).json(drive);
});

// PUT /api/placements/:id
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Drive not found' });
  res.json(updated);
});

// POST /api/placements/:id/apply
router.post('/:id/apply', async (req, res) => {
  const drive = await store.findById(FILE, req.params.id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });
  if (drive.status !== 'open') return res.status(400).json({ error: 'Drive is not open' });

  await store.updateItem(FILE, req.params.id, { applicants: (drive.applicants || 0) + 1 });

  const application = {
    id: uuidv4(),
    driveId: drive.id,
    company: drive.company,
    studentId: req.body.studentId,
    appliedAt: new Date().toISOString(),
    status: 'applied',
  };
  await store.appendData('applications.json', application);
  res.json(application);
});

// DELETE /api/placements/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Drive not found' });
  res.json({ message: 'Drive deleted' });
});

module.exports = router;
