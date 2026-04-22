/**
 * Jest configuration for magik-moji.
 *
 * Tests live next to the files under test as `*.test.ts`.
 */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.test.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/bin/install.ts',
        '!src/bin/uninstall.ts',
        '!src/bin/hook-run.ts',
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    verbose: true,
};
