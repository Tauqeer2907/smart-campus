const axios = require('axios');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Book = require('../models/Book');
const BookIssue = require('../models/BookIssue');
const { User, Notification } = require('../models');
const { emitToUser } = require('../services/notificationService');
const { success, error } = require('../utils/apiResponse');

const OPEN_LIBRARY_API = process.env.OPEN_LIBRARY_API || 'https://openlibrary.org/api/books';
const DAILY_FINE_RATE = Number(process.env.DAILY_FINE_RATE || 5);
const BOOK_ISSUE_LIMIT = Number(process.env.BOOK_ISSUE_LIMIT || 3);
const MAX_RENEWALS = Number(process.env.MAX_RENEWALS || 2);

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function calcFine(dueDate, now = new Date()) {
  const due = startOfDay(dueDate);
  const today = startOfDay(now);
  if (today <= due) return { daysOverdue: 0, fine: 0 };
  const daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  return { daysOverdue, fine: daysOverdue * DAILY_FINE_RATE };
}

async function resolveStudent(studentId) {
  const query = [{ id: studentId }, { studentId }];
  if (mongoose.Types.ObjectId.isValid(String(studentId))) {
    query.push({ _id: studentId });
  }
  return User.findOne({
    role: 'student',
    $or: query,
  });
}

async function lookupISBN(req, res) {
  try {
    const { isbn } = req.query;
    if (!isbn) return error(res, 'isbn is required', 400);

    const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await axios.get(url, { timeout: 10000 });
    const key = `ISBN:${isbn}`;
    const data = response.data?.[key];
    if (!data) return error(res, 'No details found for ISBN', 404);

    const result = {
      title: data.title || '',
      author: (data.authors || []).map((a) => a.name).join(', '),
      publisher: (data.publishers || []).map((p) => p.name).join(', '),
      coverUrl: data.cover?.large || data.cover?.medium || data.cover?.small || '',
    };

    return success(res, result);
  } catch (e) {
    return error(res, 'Failed to lookup ISBN', 500, e.message);
  }
}

async function addBook(req, res) {
  try {
    const payload = { ...req.body };
    if (!payload.isbn) return error(res, 'isbn is required', 400);

    if (!payload.title || !payload.author) {
      const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${payload.isbn}&format=json&jscmd=data`;
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data?.[`ISBN:${payload.isbn}`];
      if (data) {
        payload.title = payload.title || data.title;
        payload.author = payload.author || (data.authors || []).map((a) => a.name).join(', ');
        payload.publisher = payload.publisher || (data.publishers || []).map((p) => p.name).join(', ');
        payload.coverUrl = payload.coverUrl || data.cover?.large || data.cover?.medium || data.cover?.small || '';
      }
    }

    if (!payload.title || !payload.author) {
      return error(res, 'title and author are required (or provide valid ISBN for auto-fill)', 400);
    }

    const totalCopies = Number(payload.totalCopies || 1);
    const existing = await Book.findOne({ isbn: payload.isbn });
    if (existing) return error(res, 'Book with this ISBN already exists', 409);

    const book = await Book.create({
      isbn: payload.isbn,
      title: payload.title,
      author: payload.author,
      publisher: payload.publisher || '',
      category: payload.category || '',
      totalCopies,
      availableCopies: totalCopies,
      coverUrl: payload.coverUrl || '',
    });

    return success(res, book, 'Book added', 201);
  } catch (e) {
    return error(res, 'Failed to add book', 500, e.message);
  }
}

async function getBooks(req, res) {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;

    const books = await Book.find(filter).sort({ addedAt: -1 }).lean();
    return success(res, books);
  } catch (e) {
    return error(res, 'Failed to fetch books', 500, e.message);
  }
}

async function updateBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return error(res, 'Book not found', 404);

    const oldTotal = Number(book.totalCopies || 0);
    const oldAvailable = Number(book.availableCopies || 0);

    Object.assign(book, req.body);

    if (req.body.totalCopies !== undefined) {
      const newTotal = Number(req.body.totalCopies);
      const delta = newTotal - oldTotal;
      book.availableCopies = Math.max(0, oldAvailable + delta);
      book.totalCopies = newTotal;
    }

    await book.save();
    return success(res, book, 'Book updated');
  } catch (e) {
    return error(res, 'Failed to update book', 500, e.message);
  }
}

async function deleteBook(req, res) {
  try {
    const activeIssue = await BookIssue.findOne({ bookId: req.params.id, isReturned: false });
    if (activeIssue) return error(res, 'Cannot delete book with active issues', 400);

    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return error(res, 'Book not found', 404);

    return success(res, null, 'Book removed');
  } catch (e) {
    return error(res, 'Failed to delete book', 500, e.message);
  }
}

async function issueBook(req, res) {
  try {
    const { bookId, studentId, dueDays = 14 } = req.body;
    if (!bookId || !studentId) return error(res, 'bookId and studentId are required', 400);

    const book = await Book.findById(bookId);
    if (!book) return error(res, 'Book not found', 404);
    if (book.availableCopies <= 0) return error(res, 'No copies available', 400);

    const student = await resolveStudent(studentId);
    if (!student) return error(res, 'Student not found', 404);

    const activeIssues = await BookIssue.countDocuments({ studentId: student._id, isReturned: false });
    if (activeIssues >= BOOK_ISSUE_LIMIT) return error(res, 'Issue limit reached', 400);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(dueDays));

    const issue = await BookIssue.create({
      bookId: book._id,
      studentId: student._id,
      dueDate,
    });

    book.availableCopies -= 1;
    await book.save();

    const message = `Book '${book.title}' issued. Due: ${dueDate.toLocaleDateString()}`;
    await Notification.create({
      id: uuidv4(),
      userId: student.id || student.studentId || String(student._id),
      type: 'library',
      title: 'Book Issued',
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    emitToUser(student.id || student.studentId || String(student._id), 'library:issued', { message, dueDate, bookTitle: book.title });

    const populated = await BookIssue.findById(issue._id).populate('bookId', 'title author isbn');
    return success(res, populated, 'Book issued');
  } catch (e) {
    return error(res, 'Failed to issue book', 500, e.message);
  }
}

async function returnBook(req, res) {
  try {
    const issue = await BookIssue.findById(req.params.issueId).populate('bookId', 'title');
    if (!issue) return error(res, 'Issue record not found', 404);
    if (issue.isReturned) return error(res, 'Book already returned', 400);

    const { fine } = calcFine(issue.dueDate);
    issue.isReturned = true;
    issue.returnDate = new Date();
    issue.fine = fine;
    issue.fineStatus = fine > 0 ? 'pending' : 'none';
    await issue.save();

    await Book.findByIdAndUpdate(issue.bookId?._id || issue.bookId, { $inc: { availableCopies: 1 } });

    return success(res, {
      fine,
      returnDate: issue.returnDate,
      bookTitle: issue.bookId?.title,
    }, 'Book returned');
  } catch (e) {
    return error(res, 'Failed to return book', 500, e.message);
  }
}

async function getOverdueBooks(req, res) {
  try {
    const now = new Date();
    const issues = await BookIssue.find({ isReturned: false, dueDate: { $lt: now } })
      .populate('bookId', 'title isbn')
      .populate('studentId', 'name email branch')
      .lean();

    const result = issues.map((issue) => {
      const { daysOverdue, fine } = calcFine(issue.dueDate, now);
      return {
        ...issue,
        daysOverdue,
        currentFine: fine,
      };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue);

    return success(res, result);
  } catch (e) {
    return error(res, 'Failed to fetch overdue books', 500, e.message);
  }
}

async function waiveFine(req, res) {
  try {
    const issue = await BookIssue.findByIdAndUpdate(
      req.params.issueId,
      { $set: { fineStatus: 'waived', fine: 0 } },
      { new: true },
    );
    if (!issue) return error(res, 'Issue record not found', 404);
    return success(res, issue, 'Fine waived');
  } catch (e) {
    return error(res, 'Failed to waive fine', 500, e.message);
  }
}

async function markFinePaid(req, res) {
  try {
    const issue = await BookIssue.findByIdAndUpdate(
      req.params.issueId,
      { $set: { fineStatus: 'paid' } },
      { new: true },
    );
    if (!issue) return error(res, 'Issue record not found', 404);
    return success(res, issue, 'Fine marked as paid');
  } catch (e) {
    return error(res, 'Failed to update fine status', 500, e.message);
  }
}

async function bulkRemind(req, res) {
  try {
    const now = new Date();
    const overdue = await BookIssue.find({ isReturned: false, dueDate: { $lt: now } })
      .populate('bookId', 'title')
      .populate('studentId', 'name email id studentId')
      .lean();

    const results = await Promise.allSettled(overdue.map(async (item) => {
      const { fine } = calcFine(item.dueDate, now);
      if (!item.studentId?.email) return;
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: item.studentId.email,
        subject: `Library Overdue Notice — ${item.bookId?.title || 'Book'}`,
        text: `Dear ${item.studentId.name || 'Student'}, your book '${item.bookId?.title || 'Book'}' was due on ${new Date(item.dueDate).toLocaleDateString()}. Current fine: ₹${fine}. Please return immediately.`,
      });
    }));

    const remindedCount = results.filter((r) => r.status === 'fulfilled').length;
    return success(res, { remindedCount }, 'Overdue reminders sent');
  } catch (e) {
    return error(res, 'Failed to send reminders', 500, e.message);
  }
}

async function searchBooks(req, res) {
  try {
    const { q = '', category } = req.query;
    const filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
      ],
    };
    if (category) filter.category = category;

    const books = await Book.find(filter).lean();
    const result = books.map((b) => ({
      ...b,
      isAvailable: Number(b.availableCopies || 0) > 0,
    }));

    return success(res, result);
  } catch (e) {
    return error(res, 'Failed to search books', 500, e.message);
  }
}

async function reserveBook(req, res) {
  try {
    const student = await User.findById(req.user?.userId);
    if (!student || student.role !== 'student') return error(res, 'Student not found', 404);

    const book = await Book.findById(req.params.bookId);
    if (!book) return error(res, 'Book not found', 404);
    if (book.availableCopies <= 0) return error(res, 'No copies available', 400);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const issue = await BookIssue.create({
      bookId: book._id,
      studentId: student._id,
      dueDate,
    });

    book.availableCopies -= 1;
    await book.save();

    const userId = student.id || student.studentId || String(student._id);
    const message = `Book '${book.title}' reserved. Collect from library within 24 hours.`;
    await Notification.create({
      id: uuidv4(),
      userId,
      type: 'library',
      title: 'Book Reserved',
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    emitToUser(userId, 'library:reserved', { message, bookTitle: book.title });

    return success(res, issue, 'Book reserved', 201);
  } catch (e) {
    return error(res, 'Failed to reserve book', 500, e.message);
  }
}

async function getMyBooks(req, res) {
  try {
    let student;
    if (req.query.studentId && req.user?.role !== 'student') {
      student = await resolveStudent(req.query.studentId);
    } else {
      student = await User.findById(req.user?.userId);
    }

    if (!student) return error(res, 'Student not found', 404);

    const issues = await BookIssue.find({ studentId: student._id, isReturned: false })
      .populate('bookId', 'title author isbn category')
      .sort({ issueDate: -1 })
      .lean();

    const result = issues.map((issue) => {
      const { daysOverdue, fine } = calcFine(issue.dueDate);
      return {
        ...issue,
        isOverdue: daysOverdue > 0,
        daysOverdue,
        currentFine: fine,
      };
    });

    return success(res, result);
  } catch (e) {
    return error(res, 'Failed to fetch issued books', 500, e.message);
  }
}

async function renewBook(req, res) {
  try {
    const issue = await BookIssue.findById(req.params.issueId).populate('studentId', 'id studentId');
    if (!issue) return error(res, 'Issue record not found', 404);
    if (issue.isReturned) return error(res, 'Book already returned', 400);

    const requesterId = req.user?.id || req.user?.userId;
    const issueStudentId = issue.studentId?.id || issue.studentId?.studentId || String(issue.studentId?._id);

    if (req.user?.role === 'student' && String(requesterId) !== String(issueStudentId) && String(req.user?.userId) !== String(issue.studentId?._id)) {
      return error(res, 'Forbidden', 403);
    }

    if (Number(issue.renewCount || 0) >= MAX_RENEWALS) {
      return error(res, `Maximum renewals (${MAX_RENEWALS}) reached`, 400);
    }

    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    issue.dueDate = newDueDate;
    issue.renewCount = Number(issue.renewCount || 0) + 1;
    await issue.save();

    return success(res, issue, 'Book renewed');
  } catch (e) {
    return error(res, 'Failed to renew book', 500, e.message);
  }
}

module.exports = {
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
};
