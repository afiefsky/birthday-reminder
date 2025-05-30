// Controller just controller, any business logic placed in service
const UserService = require('../services/user.service');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: 'Email already exists'
            });
        } else {
            res.status(error.status || 500).json(error);
        }
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({
                status: 400,
                message: 'User not found'
            });
        } else {
            res.status(error.status || 500).json(error);
        }
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await UserService.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({
                status: 400,
                message: 'User not found'
            });
        } else if (error.code === 11000) {
            res.status(400).json({
                message: 'Email already exists'
            });
        } else {
            res.status(error.status || 500).json(error);
        }
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const result = await UserService.deleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({
                status: 400,
                message: 'User not found'
            });
        } else {
            res.status(error.status || 500).json(error);
        }
    }
};