module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/web-ext-artifacts/'],
  collectCoverageFrom: [
    'core/**/*.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
};
