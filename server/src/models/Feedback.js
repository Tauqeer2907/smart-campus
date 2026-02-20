const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['mess', 'hostel', 'library', 'wifi', 'sports', 'cleanliness', 'faculty', 'overall'],
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  tags: [{ type: String }],
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  submittedAt: { type: Date, default: Date.now },
  branch: { type: String },
  semester: { type: Number },
}, { timestamps: true });

const Feedback = mongoose.models.AnonymousFeedback || mongoose.model('AnonymousFeedback', feedbackSchema);

module.exports = Feedback;
