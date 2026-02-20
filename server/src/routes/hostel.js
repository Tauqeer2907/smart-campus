const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'hostel.json';

const defaultRooms = [
  { id: uuidv4(), roomNumber: 'A-101', block: 'A', floor: 1, capacity: 2, occupants: ['STU001'], type: 'Double', amenities: ['WiFi', 'AC', 'Attached Bathroom'], status: 'partially_occupied' },
  { id: uuidv4(), roomNumber: 'A-102', block: 'A', floor: 1, capacity: 2, occupants: [], type: 'Double', amenities: ['WiFi', 'Fan'], status: 'vacant' },
  { id: uuidv4(), roomNumber: 'B-201', block: 'B', floor: 2, capacity: 3, occupants: [], type: 'Triple', amenities: ['WiFi', 'Fan', 'Common Bathroom'], status: 'vacant' },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) { await store.writeData(FILE, defaultRooms); return defaultRooms; }
  return data;
}

// GET /api/hostel
router.get('/', async (req, res) => {
  await seed();
  const { block, status } = req.query;
  let data = await store.readData(FILE, []);
  if (block) data = data.filter((d) => d.block === block);
  if (status) data = data.filter((d) => d.status === status);
  res.json(data);
});

// POST /api/hostel (add room)
router.post('/', async (req, res) => {
  const room = { id: uuidv4(), ...req.body, occupants: [], status: 'vacant', createdAt: new Date().toISOString() };
  await store.appendData(FILE, room);
  res.status(201).json(room);
});

// PUT /api/hostel/:id
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Room not found' });
  res.json(updated);
});

// POST /api/hostel/complaints
router.post('/complaints', async (req, res) => {
  const complaint = {
    id: uuidv4(),
    ...req.body,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  await store.appendData('hostel_complaints.json', complaint);
  res.status(201).json(complaint);
});

// GET /api/hostel/complaints
router.get('/complaints', async (req, res) => {
  const data = await store.readData('hostel_complaints.json', []);
  res.json(data);
});

module.exports = router;
