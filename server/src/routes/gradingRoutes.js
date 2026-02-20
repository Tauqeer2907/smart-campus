const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { saveGrades, exportGradesCSV } = require('../controllers/gradingController');

router.use(protect, requireRole('faculty'));

router.post('/save', saveGrades);
router.get('/export-csv', exportGradesCSV);

module.exports = router;
