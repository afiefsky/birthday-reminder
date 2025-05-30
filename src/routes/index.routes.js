const express = require('express');
const userRoutes = require('./user.routes');

const router = express.Router();

// Mount all routes
router.use('/users', userRoutes);

// Catch-all route for non-existent endpoints
router.use('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

module.exports = router;