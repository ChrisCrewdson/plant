
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
    '!.eslintrc.js',
    '**/*.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  setupTestFrameworkScriptFile: './test/setup.js',
  testMatch: ['**/test/**/*.test.js?(x)'],
};
