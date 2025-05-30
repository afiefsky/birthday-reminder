const mongoose = require('mongoose');

const birthdayMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED'],
        default: 'PENDING'
    },
    retryCount: {
        type: Number,
        default: 0
    },
    lastRetryAt: {
        type: Date
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index to ensure one message per user per year
birthdayMessageSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BirthdayMessage', birthdayMessageSchema); 