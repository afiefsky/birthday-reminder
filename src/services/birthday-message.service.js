const BirthdayMessage = require('../models/birthday-message.model');
const User = require('../models/user.model');

const MAX_RETRIES = 3;
const RETRY_DELAY_MINUTES = 30;

exports.createPendingMessage = async (userId, year) => {
    try {
        return await BirthdayMessage.create({
            userId,
            year,
            status: 'PENDING'
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return null; // Message already exists for this user and year
        }
        throw error;
    }
};

exports.markMessageAsSent = async (messageId) => {
    return await BirthdayMessage.findByIdAndUpdate(
        messageId,
        { status: 'SENT' },
        { new: true }
    );
};

exports.markMessageAsFailed = async (messageId, error) => {
    const message = await BirthdayMessage.findById(messageId);
    if (!message) return null;

    const retryCount = message.retryCount + 1;
    const status = retryCount >= MAX_RETRIES ? 'FAILED' : 'PENDING';

    return await BirthdayMessage.findByIdAndUpdate(
        messageId,
        {
            status,
            retryCount,
            lastRetryAt: new Date(),
            error: error.message || error
        },
        { new: true }
    );
};

exports.getPendingMessages = async () => {
    const now = new Date();
    const retryThreshold = new Date(now.getTime() - (RETRY_DELAY_MINUTES * 60 * 1000));

    return await BirthdayMessage.find({
        status: 'PENDING',
        $or: [
            { lastRetryAt: { $lt: retryThreshold } },
            { lastRetryAt: { $exists: false } }
        ]
    }).populate('userId');
};

exports.getUsersWithBirthdayToday = async () => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Find users whose birthday is today
    return await User.find({
        $expr: {
            $and: [
                { $eq: [{ $month: '$birthday' }, month + 1] },
                { $eq: [{ $dayOfMonth: '$birthday' }, day] }
            ]
        }
    });
}; 