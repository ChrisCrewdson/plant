import _ from 'lodash';
import Logger, { LogFunction, TimeLogFunction, LevelType } from 'lalog';

export const mockLogger: Logger = {
  trace: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  security: jest.fn(),
  timeEnd: jest.fn(),
  time: jest.fn(),
} as unknown as Logger;

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

const loggerMockFunction: LogFunction = (errObj?: object, extra?: object): Promise<any> => {
  if (!_.isObject(errObj)) {
    throw new Error(`First param to lalog logger method is not an object: ${typeof errObj}`);
  }
  if (extra) {
    const { res, code } = extra as { res: any; code: string };
    res.status(code).send({ one: 1 });
  }
  return Promise.resolve();
};

const loggerTimeEndMockFunction: TimeLogFunction = (
  label: string, level?: LevelType, extraLogData?: object,
): Promise<any> => {
  if (typeof label !== 'string') {
    throw new Error(`1st param to lalog timeEnd method is not an string: ${typeof label}`);
  }
  if (level && typeof level !== 'string') {
    throw new Error(`2nd param to lalog timeEnd method is not an string: ${typeof level}`);
  }
  if (extraLogData && !isObject(extraLogData)) {
    throw new Error(`3rd param to lalog timeEnd method is not an object: ${typeof extraLogData}`);
  }
  if (extraLogData) {
    return loggerMockFunction(extraLogData);
  }
  return Promise.resolve();
};

const getLogMock = () => jest.fn(loggerMockFunction) as unknown as LogFunction;

export const mockLoggerReset = () => {
  // const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];
  mockLogger.trace = getLogMock();
  mockLogger.info = getLogMock();
  mockLogger.warn = getLogMock();
  mockLogger.error = getLogMock();
  mockLogger.fatal = getLogMock();
  mockLogger.security = getLogMock();
  mockLogger.timeEnd = jest.fn(loggerTimeEndMockFunction);
  mockLogger.time = jest.fn();
};

mockLoggerReset();
