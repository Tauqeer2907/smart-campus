const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookInventory', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  isReturned: { type: Boolean, default: false },
  fine: { type: Number, default: 0 },
  fineStatus: { type: String, enum: ['none', 'pending', 'paid', 'waived'], default: 'none' },
  renewCount: { type: Number, default: 0 },
}, { timestamps: true });

const BookIssue = mongoose.models.BookIssue || mongoose.model('BookIssue', bookIssueSchema);

module.exports = BookIssue;
