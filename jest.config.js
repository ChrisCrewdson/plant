
/** @type {jest.InitialOptions} */
module.exports = {
  verbose: false,
  collectCoverageFrom: [
    '!**/.vscode/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/devops/**',
    '!**/jest.config.js',
    '!**/node_modules/**',
    '!**/public/**',
    '!**/server.js',
    '!**/test/**',
    '!**/webpack**',
    '!**/github-issues/**',
    '!.eslintrc.js',
    '**/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  roots: [
    'lib',
    'app',
    'test',
  ],
  setupFilesAfterEnv: ['./test/setup.ts'],
  testMatch: ['**/test/**/*.test.[t|j]s?(x)'],
  // Jasmine, jest's default test-runner, fails silently on afterAll within
  // a describe block. This is a bug that the jest team is not going to fix
  // because they plan to use jest-circus/runner by default in the near future.
  // https://github.com/facebook/jest/issues/6692
  // TODO: Remove the testRunner option and the previous comment when jest
  // updates the default test-runner to jest-circus.
  // TODO: Enable this once Jest is upgraded to 24.x
  // testRunner: 'jest-circus/runner',
  transform: {
    '.+\\.[j|t]sx?$': 'ts-jest',
  },
};
