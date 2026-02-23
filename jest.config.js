export default {
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/server.js',
        '!src/**/app.js',
        '!src/**/routes/**',
        '!src/**/config/**',
    ],
};