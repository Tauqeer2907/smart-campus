const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String },
  category: { type: String },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true },
  coverUrl: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const Book = mongoose.models.BookInventory || mongoose.model('BookInventory', bookSchema);

module.exports = Book;
