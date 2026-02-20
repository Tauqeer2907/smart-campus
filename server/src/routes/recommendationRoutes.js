const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  saveLetter,
  submitLetter,
  getMyLetters,
  getStudentLetters,
} = require('../controllers/recommendationController');

router.use(protect, requireRole('faculty'));

router.post('/save', saveLetter);
router.post('/submit/:id', submitLetter);
router.get('/', getMyLetters);
router.get('/student/:studentId', getStudentLetters);

module.exports = router;
