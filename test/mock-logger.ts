import _ from 'lodash';

export const mockLogger: Logger = {
  trace: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  security: jest.fn(),
  timeEnd: jest.fn(),
  time: jest.fn(),
};

const isObject = (obj: object) => obj !== null && typeof obj === 'object';

interface LoggerCreateOptions {
  serviceName: string;
  moduleName: string;
}

jest.mock('lalog', () => ({
  create: (options: LoggerCreateOptions) => {
    const { serviceName, moduleName } = options;
    expect(serviceName).toBeTruthy();
    expect(moduleName).toBeTruthy();
    expect(typeof serviceName).toBe('string');
    expect(typeof moduleName).toBe('string');
    return mockLogger;
  },
  getLevel: () => 'info',
}));

/**
 * @param {object|undefined} errObj
 * @param {object=} extra
 */
const loggerMockFunction = (errObj?: object, extra?: object) => {
  if (!_.isObject(errObj)) {
    throw new Error(`First param to lalog logger method is not an object: ${typeof errObj}`);
  }
  if (extra) {
    const { res, code } = extra as { res: any; code: string };
    res.status(code).send({ one: 1 });
  }
};

/**
 * @param {string} label
 * @param {object|undefined} extraLogData
 */
const loggerTimeEndMockFunction = (label: string, extraLogData?: object) => {
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

export const mockLoggerReset = () => {
  // const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];
  mockLogger.trace = jest.fn(loggerMockFunction);
  mockLogger.info = jest.fn(loggerMockFunction);
  mockLogger.warn = jest.fn(loggerMockFunction);
  mockLogger.error = jest.fn(loggerMockFunction);
  mockLogger.fatal = jest.fn(loggerMockFunction);
  mockLogger.security = jest.fn(loggerMockFunction);
  mockLogger.timeEnd = jest.fn(loggerTimeEndMockFunction);
  // TODO: Fix the ignore below
  // @ts-ignore - [ts] Property 'error' does not exist on type 'Function'. [2339]
  mockLogger.timeEnd.error = jest.fn(loggerTimeEndMockFunction);
  mockLogger.time = jest.fn();
};

mockLoggerReset();
