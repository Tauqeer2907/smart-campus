const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'notifications.json';

// Seed default notifications
const defaultNotifications = [
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'attendance',
    title: 'Low Attendance Warning',
    message: 'Your attendance in Computer Networks has dropped below 80%. Please attend upcoming classes.',
    icon: 'alert-triangle',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
  },
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: 'Dr. Priya Verma posted "Binary Tree Traversal Implementation" for Data Structures. Due: March 15.',
    icon: 'file-text',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'library',
    title: 'Book Due Soon',
    message: 'Your borrowed book "Introduction to Algorithms" is due in 2 days. Renew or return it.',
    icon: 'book',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'hostel',
    title: 'Maintenance Update',
    message: 'Your maintenance request #MT-001 has been assigned to a technician.',
    icon: 'wrench',
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'finance',
    title: 'Fee Payment Reminder',
    message: 'Library fine of ₹250 is pending. Due date: March 1, 2026.',
    icon: 'credit-card',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: uuidv4(),
    userId: 'STU001',
    type: 'academic',
    title: 'Grade Published',
    message: 'Your grade for "ER Diagram for Library System" has been published: A',
    icon: 'award',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
  },
  {
    id: uuidv4(),
    userId: 'FAC001',
    type: 'faculty',
    title: 'Recommendation Request',
    message: 'Student Rahul Sharma has requested a recommendation letter.',
    icon: 'file-edit',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    userId: 'ADM001',
    type: 'admin',
    title: 'New Maintenance Ticket',
    message: 'A new maintenance ticket has been submitted for Room A-101.',
    icon: 'alert-circle',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) {
    await store.writeData(FILE, defaultNotifications);
    return defaultNotifications;
  }
  return data;
}

// GET /api/notifications?userId=xxx
router.get('/', async (req, res) => {
  await seed();
  const { userId } = req.query;
  let data = await store.readData(FILE, []);
  if (userId) data = data.filter((d) => d.userId === userId);
  // Sort newest first
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(data);
});

// GET /api/notifications/unread-count?userId=xxx
router.get('/unread-count', async (req, res) => {
  await seed();
  const { userId } = req.query;
  let data = await store.readData(FILE, []);
  if (userId) data = data.filter((d) => d.userId === userId);
  const unread = data.filter((d) => !d.read).length;
  res.json({ count: unread });
});

// POST /api/notifications (create notification)
router.post('/', async (req, res) => {
  const notif = {
    id: uuidv4(),
    ...req.body,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await store.appendData(FILE, notif);
  res.status(201).json(notif);
});

// PATCH /api/notifications/read-all?userId=xxx
router.patch('/read-all', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const data = await store.readData(FILE, []);
  let count = 0;
  data.forEach((notif) => {
    if (notif.userId === userId && !notif.read) {
      notif.read = true;
      count++;
    }
  });
  await store.writeData(FILE, data);
  res.json({ message: `${count} notifications marked as read`, count });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, { read: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json(updated);
});

// PATCH /api/notifications/:id/mark-read (alias for :id/read)
router.patch('/:id/mark-read', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, { read: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json(updated);
});

// POST /api/notifications/clear-all - Clear all notifications for user
router.post('/clear-all', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required in body' });
    }

    const data = await store.readData(FILE, []);
    const filteredData = data.filter((notif) => notif.userId !== userId);
    await store.writeData(FILE, filteredData);

    res.json({ 
      message: 'All notifications cleared',
      count: data.length - filteredData.length
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Notification not found' });
  res.json({ message: 'Notification deleted' });
});

module.exports = router;
