const express = require('express');
const router = express.Router();
const store = require('../utils/store');

const USERS_FILE = 'users.json';

// GET /api/users
router.get('/', async (req, res) => {
  const { role } = req.query;
  let users = await store.readData(USERS_FILE, []);
  if (role) users = users.filter((u) => u.role === role);
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const user = await store.findById(USERS_FILE, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(USERS_FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(USERS_FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
});

module.exports = router;
