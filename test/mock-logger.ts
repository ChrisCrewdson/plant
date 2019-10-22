import _ from 'lodash';
import Logger from 'lalog';

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

const loggerMockFunction = (errObj?: object, extra?: object) => {
  if (!_.isObject(errObj)) {
    throw new Error(`First param to lalog logger method is not an object: ${typeof errObj}`);
  }
  if (extra) {
    const { res, code } = extra as { res: any; code: string };
    res.status(code).send({ one: 1 });
  }
};

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

type LogFunction = (logData: any, response?: any) => Promise<any>;
declare type TimeLogFunction = (label: string, extraLogDat?: any) => Promise<any>;
interface TimeEndLog {
  (label: string, extraLogDat?: any): Promise<any>;
  trace?: TimeLogFunction;
  info?: TimeLogFunction;
  warn?: TimeLogFunction;
  error?: TimeLogFunction;
  fatal?: TimeLogFunction;
  security?: TimeLogFunction;
}

const getLogMock = () => jest.fn(loggerMockFunction) as unknown as LogFunction;

export const mockLoggerReset = () => {
  // const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];
  mockLogger.trace = getLogMock();
  mockLogger.info = getLogMock();
  mockLogger.warn = getLogMock();
  mockLogger.error = getLogMock();
  mockLogger.fatal = getLogMock();
  mockLogger.security = getLogMock();
  mockLogger.timeEnd = jest.fn(loggerTimeEndMockFunction) as unknown as TimeEndLog;
  mockLogger.timeEnd.error = jest.fn(loggerTimeEndMockFunction) as unknown as TimeLogFunction;
  mockLogger.time = jest.fn();
};

mockLoggerReset();
