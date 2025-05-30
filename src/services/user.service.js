const User = require('../models/user.model');

// validateUserData is private to only user.service
const validateUserData = (userData) => {
    const {name, email, birthday, timezone} = userData;
    const errors = [];

    // Name validation
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    // Email validation
    if (!email || email.trim() === '') {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }

    // Birthday validation
    if (!birthday) {
        errors.push('Birthday is required');
    } else {
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
            errors.push('Birthday must be a valid date');
        }
    }

    // Timezone validation
    if (!timezone || timezone.trim() === '') {
        errors.push('Timezone is required');
    } else {
        try {
            Intl.DateTimeFormat(undefined, {
                timeZone: timezone
            });
        } catch (e) {
            errors.push('Invalid timezone');
        }
    }

    return errors;
};

// validatePartialUserData is private to only user.service
const validatePartialUserData = (userData) => {
    const {name, email, birthday, timezone} = userData;
    const errors = [];

    // Check if at least one field is present
    if (!name && !email && !birthday && !timezone) {
        errors.push('At least one field must be provided for update');
        return errors;
    }

    // Name validation (if present)
    if (name !== undefined) {
        if (name.trim() === '') {
            errors.push('Name cannot be empty');
        }
    }

    // Email validation (if present)
    if (email !== undefined) {
        if (email.trim() === '') {
            errors.push('Email cannot be empty');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
        }
    }

    // Birthday validation (if present)
    if (birthday !== undefined) {
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
            errors.push('Birthday must be a valid date');
        }
    }

    // Timezone validation (if present)
    if (timezone !== undefined) {
        if (timezone.trim() === '') {
            errors.push('Timezone cannot be empty');
        } else {
            try {
                Intl.DateTimeFormat(undefined, {
                    timeZone: timezone
                });
            } catch (e) {
                errors.push('Invalid timezone');
            }
        }
    }

    return errors;
};

// Private function used by birthday worker
exports.getAllUsers = async () => {
    return await User.find({});
};

exports.createUser = async (userData) => {
    const errors = validateUserData(userData);
    if (errors.length > 0) {
        throw {status: 400, errors};
    }

    const user = new User(userData);
    return await user.save();
};

exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw {status: 404, message: 'User not found'};
    }
    return user;
};

exports.updateUser = async (id, userData) => {
    const errors = validatePartialUserData(userData);
    if (errors.length > 0) {
        throw {status: 400, errors};
    }

    const user = await User.findByIdAndUpdate(id, userData, {
        new: true
    });
    if (!user) {
        throw {status: 404, message: 'User not found'};
    }
    return user;
};

exports.deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw {status: 404, message: 'User not found'};
    }
    return {
        message: 'User deleted successfully'
    };
};
