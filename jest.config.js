module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/backend'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/backend/**/*.ts',
    '!src/backend/app.ts',
    '!src/backend/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
