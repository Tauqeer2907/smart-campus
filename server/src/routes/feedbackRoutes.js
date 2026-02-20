const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  submitFeedback,
  getAnalytics,
  getCategoryBreakdown,
  getRatingTrend,
  getFlaggedFeedback,
} = require('../controllers/feedbackController');

router.post('/', submitFeedback);

router.get('/analytics', protect, requireRole('admin'), getAnalytics);
router.get('/analytics/category', protect, requireRole('admin'), getCategoryBreakdown);
router.get('/analytics/trend', protect, requireRole('admin'), getRatingTrend);
router.get('/flagged', protect, requireRole('admin'), getFlaggedFeedback);

module.exports = router;
