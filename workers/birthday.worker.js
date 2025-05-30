/**
 * The reason why the worker is placed outside the `src` folder is because it's intended to be independent from the main application.
 * When it's independent, any failure or change in the worker or the main app won't affect the other.
 * This is a good practice as it improves maintainability and scalability (and observability: NewRelic, Grafana, etc).
 * 
 * For this assignment, the worker runs alongside the main application because `index.js` starts all three components (for simplicity):
 * the main app, the worker, and MongoDB.
 * 
 * In a real-world setup, this worker would be run as a separate process using a process manager like PM2.
 */
const cron = require('node-cron');
const birthdayMessageService = require('../src/services/birthday-message.service');

const sendBirthdayMessage = async (user) => {
    // In a real application, this would send an email or push notification
    // Example email third-party: Infobip (also handle SMS)
    // Example push notification third-party: Firebase
    // Example WhatsApp third-party: Mekari Qontak
    console.log(`🎉 Happy Birthday, ${user.name}! 🎂`);
    
    // Simulate potential failure (remove in production)
    if (Math.random() < 0.2) { // 20% chance of failure
        throw new Error('Failed to send birthday message');
    }
};

const processBirthdayMessages = async () => {
    console.log("Begin processing birthday messages");

    try {
        // Get all pending messages that are ready for processing
        const pendingMessages = await birthdayMessageService.getPendingMessages();
        
        for (const message of pendingMessages) {
            const user = message.userId;
            const userNow = new Date(new Date().toLocaleString('en-US', { timeZone: user.timezone }));

            // Only process if it's 9 AM in the user's timezone
            if (userNow.getHours() === 9 && userNow.getMinutes() === 0) {
                try {
                    await sendBirthdayMessage(user);
                    await birthdayMessageService.markMessageAsSent(message._id);
                    console.log(`Successfully sent birthday message to ${user.name}`);
                } catch (error) {
                    await birthdayMessageService.markMessageAsFailed(message._id, error);
                    console.error(`Failed to send birthday message to ${user.name}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('Error processing birthday messages:', error);
    }

    console.log("End processing birthday messages");
};

const scheduleBirthdayMessages = async () => {
    console.log("Begin scheduling birthday messages");

    try {
        // Get users with birthdays today
        const usersWithBirthdayToday = await birthdayMessageService.getUsersWithBirthdayToday();
        const currentYear = new Date().getFullYear();

        // Create pending messages for each user
        for (const user of usersWithBirthdayToday) {
            await birthdayMessageService.createPendingMessage(user._id, currentYear);
        }
    } catch (error) {
        console.error('Error scheduling birthday messages:', error);
    }

    console.log("End scheduling birthday messages");
};

// Main app
exports.setupBirthdayWorker = () => {
    // Schedule new birthday messages at midnight UTC
    cron.schedule('0 0 * * *', scheduleBirthdayMessages);
    
    // Process pending messages every minute
    cron.schedule('* * * * *', processBirthdayMessages);
    
    console.log('Birthday worker started');
    if (process.env.SIMULATED_TIME) {
        console.log(`Using simulated time: ${process.env.SIMULATED_TIME}`);
    }
};