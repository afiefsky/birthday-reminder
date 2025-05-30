const express = require('express');
const { createUser, getUserById, updateUser, deleteUser, getAllUsers } = require('../controllers/user.controller');

const router = express.Router();

// Routes
router.get('/', getAllUsers); // This get all users is just for testing, not required in the assignment
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router; 