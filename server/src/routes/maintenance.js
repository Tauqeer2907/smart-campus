const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');

const FILE = 'maintenance_tickets.json';

// Default seed tickets
const defaultTickets = [
  {
    id: 'MT-001',
    studentId: 'STU001',
    roomNumber: 'A-101',
    category: 'Electrical',
    description: 'The ceiling fan in the room is making a loud noise and vibrating excessively.',
    photo: null,
    status: 'in_progress',
    stages: {
      requested: { completed: true, at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      assigned: { completed: true, at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Raju - Electrician' },
      in_progress: { completed: true, at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      fixed: { completed: false },
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) {
    await store.writeData(FILE, defaultTickets);
    return defaultTickets;
  }
  return data;
}

// GET /api/maintenance/tickets?studentId=xxx
router.get('/tickets', async (req, res) => {
  await seed();
  const { studentId, status } = req.query;
  let data = await store.readData(FILE, []);
  if (studentId) data = data.filter((d) => d.studentId === studentId);
  if (status) data = data.filter((d) => d.status === status);
  // Sort newest first
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(data);
});

// GET /api/maintenance/tickets/:id
router.get('/tickets/:id', async (req, res) => {
  await seed();
  const ticket = await store.findById(FILE, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// POST /api/maintenance/ticket (student submits maintenance request)
router.post('/ticket', upload.single('photo'), async (req, res) => {
  try {
    const { studentId, category, description, roomNumber } = req.body;

    // Validate
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });
    if (!category) return res.status(400).json({ error: 'category is required' });
    if (!description || description.length < 20) {
      return res.status(400).json({ error: 'Description must be at least 20 characters' });
    }
    if (!roomNumber) return res.status(400).json({ error: 'roomNumber is required' });

    const validCategories = ['Electrical', 'Plumbing', 'Furniture', 'Internet', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }

    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/maintenance');
      photoUrl = result.url;
    }

    // Generate ticket ID
    const allTickets = await store.readData(FILE, []);
    const ticketNum = String(allTickets.length + 1).padStart(3, '0');

    const ticket = {
      id: `MT-${ticketNum}`,
      studentId,
      roomNumber,
      category,
      description,
      photo: photoUrl,
      status: 'requested',
      stages: {
        requested: { completed: true, at: new Date().toISOString() },
        assigned: { completed: false },
        in_progress: { completed: false },
        fixed: { completed: false },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.appendData(FILE, ticket);

    // Also create a notification
    const notif = {
      id: uuidv4(),
      userId: studentId,
      type: 'hostel',
      title: 'Maintenance Request Submitted',
      message: `Your maintenance request ${ticket.id} (${category}) has been submitted successfully. We'll assign a technician soon.`,
      icon: 'wrench',
      read: false,
      createdAt: new Date().toISOString(),
    };
    await store.appendData('notifications.json', notif);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/maintenance/ticket/:id/assign (admin assigns technician)
router.patch('/ticket/:id/assign', async (req, res) => {
  const ticket = await store.findById(FILE, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates = {
    status: 'assigned',
    stages: {
      ...ticket.stages,
      assigned: { completed: true, at: new Date().toISOString(), assignedTo: req.body.assignedTo || 'Technician' },
    },
    updatedAt: new Date().toISOString(),
  };

  const updated = await store.updateItem(FILE, req.params.id, updates);

  // Notify student
  await store.appendData('notifications.json', {
    id: uuidv4(),
    userId: ticket.studentId,
    type: 'hostel',
    title: 'Technician Assigned',
    message: `Your maintenance request ${ticket.id} has been assigned to ${req.body.assignedTo || 'a technician'}.`,
    icon: 'wrench',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json(updated);
});

// PATCH /api/maintenance/ticket/:id/progress (mark in progress)
router.patch('/ticket/:id/progress', async (req, res) => {
  const ticket = await store.findById(FILE, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates = {
    status: 'in_progress',
    stages: {
      ...ticket.stages,
      in_progress: { completed: true, at: new Date().toISOString() },
    },
    updatedAt: new Date().toISOString(),
  };

  const updated = await store.updateItem(FILE, req.params.id, updates);
  res.json(updated);
});

// PATCH /api/maintenance/ticket/:id/fix (mark as fixed)
router.patch('/ticket/:id/fix', async (req, res) => {
  const ticket = await store.findById(FILE, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates = {
    status: 'fixed',
    stages: {
      ...ticket.stages,
      fixed: { completed: true, at: new Date().toISOString() },
    },
    updatedAt: new Date().toISOString(),
  };

  const updated = await store.updateItem(FILE, req.params.id, updates);

  // Notify student
  await store.appendData('notifications.json', {
    id: uuidv4(),
    userId: ticket.studentId,
    type: 'hostel',
    title: 'Issue Fixed',
    message: `Your maintenance request ${ticket.id} has been fixed. Please confirm if the issue is resolved.`,
    icon: 'check-circle',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json(updated);
});

// PATCH /api/maintenance/ticket/:id/confirm (student confirms resolved)
router.patch('/ticket/:id/confirm', async (req, res) => {
  const ticket = await store.findById(FILE, req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates = {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = await store.updateItem(FILE, req.params.id, updates);
  res.json(updated);
});

// GET /api/maintenance/stats (admin overview)
router.get('/stats', async (req, res) => {
  const data = await store.readData(FILE, []);
  const stats = {
    total: data.length,
    requested: data.filter((d) => d.status === 'requested').length,
    assigned: data.filter((d) => d.status === 'assigned').length,
    in_progress: data.filter((d) => d.status === 'in_progress').length,
    fixed: data.filter((d) => d.status === 'fixed').length,
    resolved: data.filter((d) => d.status === 'resolved').length,
    byCategory: {},
  };
  data.forEach((t) => {
    stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
  });
  res.json(stats);
});

module.exports = router;
