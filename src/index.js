const express = require('express'); // API Framework
const mongoose = require('mongoose'); // MongoDB ORM
const {setupBirthdayWorker} = require('../workers/birthday.worker'); // Worker
const routes = require('./routes/index.routes'); // Routes

const app = express(); // Express app

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', routes);

// 1) Start MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // 2) Start birthday worker
        setupBirthdayWorker();
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// 3) Start main-app/server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});