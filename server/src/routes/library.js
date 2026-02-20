const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'library.json';

const defaultBooks = [
  { id: uuidv4(), title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'Computer Science', available: 3, total: 5, location: 'Shelf A-12' },
  { id: uuidv4(), title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', isbn: '978-1118063330', category: 'Computer Science', available: 2, total: 4, location: 'Shelf A-14' },
  { id: uuidv4(), title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0073523323', category: 'Computer Science', available: 4, total: 6, location: 'Shelf A-16' },
  { id: uuidv4(), title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', isbn: '978-0133594140', category: 'Computer Science', available: 1, total: 3, location: 'Shelf B-02' },
  { id: uuidv4(), title: 'Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091550', category: 'Mathematics', available: 5, total: 8, location: 'Shelf C-05' },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) { await store.writeData(FILE, defaultBooks); return defaultBooks; }
  return data;
}

// GET /api/library
router.get('/', async (req, res) => {
  await seed();
  const { category, search } = req.query;
  let data = await store.readData(FILE, []);
  if (category) data = data.filter((d) => d.category === category);
  if (search) {
    const q = search.toLowerCase();
    data = data.filter((d) => d.title.toLowerCase().includes(q) || d.author.toLowerCase().includes(q));
  }
  res.json(data);
});

// GET /api/library/books (alias with search support)
router.get('/books', async (req, res) => {
  await seed();
  const { search, category } = req.query;
  let data = await store.readData(FILE, []);
  if (category) data = data.filter((d) => d.category === category);
  if (search) {
    const q = search.toLowerCase();
    data = data.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.author.toLowerCase().includes(q) ||
      (d.isbn && d.isbn.includes(q))
    );
  }
  // Add availability status
  data = data.map((book) => ({
    ...book,
    availabilityStatus: book.available > 0 ? 'Available' : 'Unavailable',
  }));
  res.json(data);
});

// GET /api/library/my-books?studentId=xxx
router.get('/my-books', async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: 'studentId required' });

  const borrows = await store.readData('borrows.json', []);
  const myBooks = borrows
    .filter((b) => b.studentId === studentId && b.status === 'borrowed')
    .map((b) => {
      const dueDate = new Date(b.dueDate);
      const now = new Date();
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return {
        ...b,
        daysRemaining,
        isOverdue: daysRemaining < 0,
        isUrgent: daysRemaining <= 2 && daysRemaining >= 0,
      };
    });

  res.json(myBooks);
});

// POST /api/library (add book)
router.post('/', async (req, res) => {
  const book = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  await store.appendData(FILE, book);
  res.status(201).json(book);
});

// PUT /api/library/:id
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Book not found' });
  res.json(updated);
});

// POST /api/library/:id/borrow
router.post('/:id/borrow', async (req, res) => {
  const book = await store.findById(FILE, req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.available <= 0) return res.status(400).json({ error: 'No copies available' });

  await store.updateItem(FILE, req.params.id, { available: book.available - 1 });

  // Record borrowing
  const borrow = {
    id: uuidv4(),
    bookId: book.id,
    bookTitle: book.title,
    studentId: req.body.studentId,
    borrowedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'borrowed',
  };
  await store.appendData('borrows.json', borrow);
  res.json(borrow);
});

// POST /api/library/:id/return
router.post('/:id/return', async (req, res) => {
  const book = await store.findById(FILE, req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  await store.updateItem(FILE, req.params.id, { available: Math.min(book.available + 1, book.total) });

  const borrows = await store.readData('borrows.json', []);
  const borrow = borrows.find((b) => b.bookId === req.params.id && b.studentId === req.body.studentId && b.status === 'borrowed');
  if (borrow) {
    await store.updateItem('borrows.json', borrow.id, { status: 'returned', returnedAt: new Date().toISOString() });
  }

  res.json({ message: 'Book returned successfully' });
});

// POST /api/library/reserve
router.post('/reserve', async (req, res) => {
  const { bookId, studentId, studentName } = req.body;
  if (!bookId || !studentId) return res.status(400).json({ error: 'bookId and studentId required' });

  await seed();
  const book = await store.findById(FILE, bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.available <= 0)
    return res.status(400).json({ error: 'No copies available for reservation' });

  // Decrement availability
  await store.updateItem(FILE, bookId, { available: book.available - 1 });

  // Create a reservation record (like borrow but with status=reserved)
  const reservation = {
    id: uuidv4(),
    bookId: book.id,
    bookTitle: book.title,
    author: book.author,
    studentId,
    studentName: studentName || 'Unknown',
    reservedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'borrowed',
  };
  await store.appendData('borrows.json', reservation);

  // Create a notification for the student
  const notification = {
    id: uuidv4(),
    userId: studentId,
    type: 'library',
    title: 'Book Reserved',
    message: `You have successfully reserved "${book.title}". Pick it up from ${book.location || 'the library counter'}. Due date: ${new Date(reservation.dueDate).toLocaleDateString()}.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await store.appendData('notifications.json', notification);

  res.status(201).json({
    success: true,
    reservation,
    message: `Book "${book.title}" reserved successfully!`,
  });
});

// PATCH /api/library/renew/:issueId
router.patch('/renew/:issueId', async (req, res) => {
  const { issueId } = req.params;
  const borrows = await store.readData('borrows.json', []);
  const borrow = borrows.find((b) => b.id === issueId && b.status === 'borrowed');
  if (!borrow) return res.status(404).json({ error: 'Active borrow record not found' });

  // Extend due date by 7 days from current due date
  const currentDue = new Date(borrow.dueDate);
  const newDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);

  const renewCount = (borrow.renewCount || 0) + 1;
  if (renewCount > 2) return res.status(400).json({ error: 'Maximum renewal limit (2) reached' });

  await store.updateItem('borrows.json', issueId, {
    dueDate: newDue.toISOString(),
    renewCount,
    lastRenewedAt: new Date().toISOString(),
  });

  // Notify student
  const notification = {
    id: uuidv4(),
    userId: borrow.studentId,
    type: 'library',
    title: 'Book Renewed',
    message: `Your book "${borrow.bookTitle}" has been renewed. New due date: ${newDue.toLocaleDateString()}.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await store.appendData('notifications.json', notification);

  res.json({
    success: true,
    newDueDate: newDue.toISOString(),
    renewCount,
    message: `Book renewed successfully. New due date: ${newDue.toLocaleDateString()}.`,
  });
});

// DELETE /api/library/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted' });
});

module.exports = router;
