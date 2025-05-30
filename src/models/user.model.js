const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required'],
        set: function(v) {
            return new Date(v).toISOString();
        }
    },
    timezone: {
        type: String,
        required: [true, 'Timezone is required'],
        validate: {
            validator: function(v) {
                try {
                    Intl.DateTimeFormat(undefined, {
                        timeZone: v
                    });
                    return true;
                } catch (e) {
                    return false;
                }
            },
            message: 'Invalid timezone',
        },
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);