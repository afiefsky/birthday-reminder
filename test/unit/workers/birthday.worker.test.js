const { setupBirthdayWorker } = require('../../../workers/birthday.worker');
const userService = require('../../../src/services/user.service');

jest.mock('../../../src/services/user.service');
jest.mock('node-cron', () => ({
    schedule: jest.fn((_, callback) => {
        callback?.();
        return { start: jest.fn() };
    }),
}));

describe('Birthday Worker', () => {
    const mockUser = {
        name: 'John Doe',
        birthday: new Date('1990-05-30T00:00:00.000Z'),
        timezone: 'Asia/Jakarta',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        delete process.env.SIMULATED_TIME;
    });

    it('sends birthday message at correct time', async () => {
        userService.getAllUsers.mockResolvedValue([mockUser]);
        process.env.SIMULATED_TIME = '2024-05-30T09:00:00+07:00';

        setupBirthdayWorker();
        await new Promise(setImmediate); // simpler than setTimeout(resolve, 0)

        expect(console.log).toHaveBeenCalledWith('🎉 Happy Birthday, John Doe! 🎂');
    });

    it('does not send birthday message if not 9 AM or not birthday', async () => {
        userService.getAllUsers.mockResolvedValue([mockUser]);
        process.env.SIMULATED_TIME = '2024-05-30T08:59:00+07:00'; // 8:59 AM
        
        setupBirthdayWorker();
        await new Promise(setImmediate);
        
        expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('Happy Birthday'));
    });
});
