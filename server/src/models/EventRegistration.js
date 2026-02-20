const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
    {
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        studentName: { type: String, required: true },
        studentEmail: { type: String, required: true },
        studentId: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate registrations
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
