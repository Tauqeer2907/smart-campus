const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  lookupISBN,
  addBook,
  getBooks,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getOverdueBooks,
  waiveFine,
  markFinePaid,
  bulkRemind,
  searchBooks,
  reserveBook,
  getMyBooks,
  renewBook,
} = require('../controllers/libraryController');

router.get('/books/search', protect, requireRole('student', 'faculty', 'admin'), searchBooks);
router.get('/books/isbn-lookup', protect, requireRole('admin'), lookupISBN);
router.get('/books', protect, requireRole('admin', 'faculty'), getBooks);
router.post('/books', protect, requireRole('admin'), addBook);
router.patch('/books/:id', protect, requireRole('admin'), updateBook);
router.delete('/books/:id', protect, requireRole('admin'), deleteBook);

router.post('/issue', protect, requireRole('admin'), issueBook);
router.post('/return/:issueId', protect, requireRole('admin'), returnBook);
router.get('/overdue', protect, requireRole('admin'), getOverdueBooks);
router.post('/fine/:issueId/waive', protect, requireRole('admin'), waiveFine);
router.patch('/fine/:issueId/paid', protect, requireRole('admin'), markFinePaid);
router.post('/bulk-remind', protect, requireRole('admin'), bulkRemind);

router.post('/reserve/:bookId', protect, requireRole('student'), reserveBook);
router.get('/my-books', protect, requireRole('student', 'admin', 'faculty'), getMyBooks);
router.post('/renew/:issueId', protect, requireRole('student', 'admin'), renewBook);

module.exports = router;
