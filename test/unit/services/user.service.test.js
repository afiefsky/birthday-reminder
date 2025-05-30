const userService = require('../../../src/services/user.service');
const User = require('../../../src/models/user.model');

jest.mock('../../../src/models/user.model');

describe('User Creation and Validation', () => {
    const validUserData = {
        name: 'John Doe',
        email: 'john@example.com',
        birthday: '1990-01-01T00:00:00.000Z',
        timezone: 'America/New_York'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a user with valid data', async () => {
        const mockUser = { ...validUserData, _id: '123' };
        User.prototype.save = jest.fn().mockResolvedValue(mockUser);
        User.findOne = jest.fn().mockResolvedValue(null);

        const result = await userService.createUser(validUserData);

        expect(result).toEqual(mockUser);
    });

    it('should validate email and timezone', async () => {
        const invalidData = {
            ...validUserData,
            email: 'invalid-email',
            timezone: 'Invalid/Timezone'
        };

        await expect(userService.createUser(invalidData))
            .rejects
            .toMatchObject({ status: 400 });
    });
});

// User management to test each API (not just what asked in the assignment)
describe('User Management', () => {
    const mockUser = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        birthday: '1990-01-01T00:00:00.000Z',
        timezone: 'America/New_York'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve user by ID', async () => {
        User.findById = jest.fn().mockResolvedValue(mockUser);

        const result = await userService.getUserById('123');

        expect(result).toEqual(mockUser);
        expect(User.findById).toHaveBeenCalledWith('123');
    });

    it('should throw when user not found', async () => {
        User.findById = jest.fn().mockResolvedValue(null);
    
        await expect(userService.getUserById('nonexistent'))
            .rejects
            .toMatchObject({ status: 404, message: 'User not found' });
    });

    it('should update user details', async () => {
        const updateData = {
            name: 'John Updated',
            email: 'john.updated@example.com',
            birthday: '1990-01-01T00:00:00.000Z',
            timezone: 'America/New_York'
        };
        const updatedUser = { ...mockUser, ...updateData };
        User.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

        const result = await userService.updateUser('123', updateData);

        expect(result).toEqual(updatedUser);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, { new: true });
    });

    it('should throw when updating non-existent user', async () => {
        User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    
        await expect(userService.updateUser('nonexistent', mockUser))
            .rejects
            .toMatchObject({ status: 404, message: 'User not found' });
    });

    it('should delete user', async () => {
        User.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);

        const result = await userService.deleteUser('123');

        expect(result).toEqual({ message: 'User deleted successfully' });
        expect(User.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should throw when deleting non-existent user', async () => {
        User.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    
        await expect(userService.deleteUser('nonexistent'))
            .rejects
            .toMatchObject({ status: 404, message: 'User not found' });
    });
});