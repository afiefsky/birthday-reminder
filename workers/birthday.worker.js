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
const userService = require('../src/services/user.service');

// Keep track of which users have received birthday messages today
// In several case, this replaced with insert to db, or redis, 
// or any other storage that keeps track on user that already got their birthday message in a year
const birthdayMessagesSent = new Set();

const sendBirthdayMessage = async (user) => {
    // In a real application, this would send an email or push notification
    // Example email third-party: Infobip (also handle SMS)
    // Example push notification third-party: Firebase
    // Example WhatsApp third-party: Mekari Qontak
    // Third-party code should be placed in Services folder, i.e: src/services/infobip.service.js
    // or: src/services/API/infobip.service.js (so all third party code is in API folder)
    console.log(`🎉 Happy Birthday, ${user.name}! 🎂`);
};

const checkBirthdays = async () => {
    console.log("Begin checkBirthdays");

    try {
        // Use the user service to get all users
        const users = await userService.getAllUsers();
        
        // Use simulated time if provided in environment variable, otherwise use current time
        const now = process.env.SIMULATED_TIME ? new Date(process.env.SIMULATED_TIME) : new Date();

        for (const user of users) {
            const birthday = new Date(user.birthday); // convert user-data from db, to date object
            const userNow = new Date(now.toLocaleString('en-US', { timeZone: user.timezone })); // this userNow means current-time (or server time, the time that this worker runs) in user's timezone

            // console.log(`Checking user ${user.name}: user birthday ${birthday.toISOString()}, current userDate ${userNow.toISOString()}, hour: ${userNow.getHours()}, minute: ${userNow.getMinutes()}`);

            // Create a unique key for this user and date (meaning if user updated their birthday, it will be a new key)
            const messageKey = `${user._id}-${userNow.toISOString().split('T')[0]}`;

            // Check if it's the user's birthday and it's exactly 9 AM in their timezone
            // and they haven't received a message today
            if (
                birthday.getMonth() === userNow.getMonth() &&
                birthday.getDate() === userNow.getDate() &&
                userNow.getHours() === 9 &&
                userNow.getMinutes() === 0 &&
                !birthdayMessagesSent.has(messageKey)
            ) {
                console.log(`Sending birthday message to ${user.name}`);
                await sendBirthdayMessage(user);
                birthdayMessagesSent.add(messageKey);
            }
        }
    } catch (error) {
        console.error('Error checking birthdays:', error);
    }

    console.log("End checkBirthdays");
};

// Main app
exports.setupBirthdayWorker = () => {
    // Run every minute to check for birthdays
    cron.schedule('* * * * *', checkBirthdays);
    
    console.log('Birthday worker started');
    if (process.env.SIMULATED_TIME) {
        console.log(`Using simulated time: ${process.env.SIMULATED_TIME}`);
    }
};