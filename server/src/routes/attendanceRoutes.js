const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { markAttendance, notifyAtRiskStudent } = require('../controllers/attendanceController');

router.use(protect, requireRole('faculty'));

router.post('/mark', markAttendance);
router.post('/notify-student', notifyAtRiskStudent);

module.exports = router;
