import { expect, jest } from '@jest/globals';

jest.unstable_mockModule('../auth.repository.js', () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
}));

jest.unstable_mockModule('../refreshToken.repository.js', () => ({
    insertRefreshToken: jest.fn(),
}));

jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn(() => 'mock.jwt.token'),
    },
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: {
        jwtSecret: 'secret',
        jwtExpiresIn: '1h',
        refreshTokenSecret: 'rsecret',
        refreshTokenExpiresIn: '7d',
        bcryptSaltRounds: 10,
    },
}));

const repo = await import('../auth.repository.js');
const rtRepo = await import('../refreshToken.repository.js');
const bcrypt = (await import('bcrypt')).default;
const jwt = (await import('jsonwebtoken')).default;

const service = await import('../auth.service.js');

describe('auth.service', () => {
    test('register - throws 400 when missing fields', async () => {
        await expect(service.register({ name: '', email: '', password: '' }))
            .rejects
            .toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
    });

    test('register - throws 409 when email exists', async () => {
        repo.findUserByEmail.mockResolvedValue({ id: 'u1' });


        await expect(service.register({ name: 'a', email: 'a@test.com', password: 'x' }))
            .rejects
            .toMatchObject({ statusCode: 409, code: 'EMAIL_ALREADY_USED' });
    });

    test('register - creates user and returns tokens', async () => {
        repo.findUserByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed');
        repo.createUser.mockResolvedValue({ id: 'u1', name: 'A', email: 'a@test.com', role: 'customer' });
        rtRepo.insertRefreshToken.mockResolvedValue({ id: 't1' });

        const result = await service.register({ name: 'A', email: 'a@test.com', password: 'Password123' });

        expect(repo.createUser).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
        expect(rtRepo.insertRefreshToken).toHaveBeenCalled();
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user.email).toBe('a@test.com');
    });

    test('login - return safe user + tokens', async () => {
        repo.findUserByEmail.mockResolvedValue({
            id: 'u1',
            name: 'A',
            email: 'a@test.com',
            role: 'customer',
            password: 'hashedpw',
            created_at: new Date().toISOString(),
        });
        bcrypt.compare.mockResolvedValue(true);
        rtRepo.insertRefreshToken.mockResolvedValue({ id: 't1' });

        const result = await service.login({ email: 'a@test.com', password: 'Password123!' });

        expect(result.user).not.toHaveProperty('password');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
    });
});