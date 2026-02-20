const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notifications.controller');
const { protect, authorize } = require('../middleware/auth');

// Student: get notification count & unread events
router.get('/', protect, authorize('student'), getNotifications);

module.exports = router;
