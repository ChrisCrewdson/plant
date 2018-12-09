const _ = require('lodash');

/** @type {Logger} */
const mockLogger = {};

const isObject = obj => obj !== null && typeof obj === 'object';

jest.mock('lalog', () => ({
  /**
   * @param {object} options
   * @param {string} options.serviceName
   * @param {string} options.moduleName
   */
  create: ({ serviceName, moduleName }) => {
    expect(serviceName).toBeTruthy();
    expect(moduleName).toBeTruthy();
    expect(typeof serviceName).toBe('string');
    expect(typeof moduleName).toBe('string');
    return mockLogger;
  },
  getLevel: () => 'info',
}));

const loggerMockFunction = (errObj, extra) => {
  if (!_.isObject(errObj)) {
    throw new Error(`First param to lalog logger method is not an object: ${typeof errObj}`);
  }
  if (extra) {
    const { res, code } = extra;
    res.status(code).send({ one: 1 });
  }
};

const loggerTimeEndMockFunction = (label, extraLogData) => {
  if (typeof label !== 'string') {
    throw new Error(`First param to lalog timeEnd method is not an string: ${typeof label}`);
  }
  if (extraLogData && !isObject(extraLogData)) {
    throw new Error(`Second param to lalog timeEnd method is not an object: ${typeof extraLogData}`);
  }
  if (extraLogData) {
    loggerMockFunction(extraLogData);
  }
};

const loggerMockReset = () => {
  // const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];
  mockLogger.trace = jest.fn(loggerMockFunction);
  mockLogger.info = jest.fn(loggerMockFunction);
  mockLogger.warn = jest.fn(loggerMockFunction);
  mockLogger.error = jest.fn(loggerMockFunction);
  mockLogger.fatal = jest.fn(loggerMockFunction);
  mockLogger.security = jest.fn(loggerMockFunction);
  mockLogger.timeEnd = jest.fn(loggerTimeEndMockFunction);
  mockLogger.timeEnd.error = jest.fn(loggerTimeEndMockFunction);
  mockLogger.time = jest.fn();
};

loggerMockReset();

module.exports = {
  mockLogger,
  mockLoggerReset: loggerMockReset,
};
