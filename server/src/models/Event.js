const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        date: { type: String, required: true },
        venue: { type: String, required: true },
        type: {
            type: String,
            enum: ['academic', 'cultural', 'sports', 'placement', 'general'],
            default: 'general',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdByName: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
