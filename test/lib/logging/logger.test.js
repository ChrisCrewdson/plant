// const _ = require('lodash');
const assert = require('assert');

describe('Logger', () => {
  describe('Basic logging', () => {
    // eslint-disable-next-line global-require
    const Logger = require('../../../lib/logging/logger');
    test('should set/get the log levels', () => {
      let level = 'trace';
      Logger.setLevel(level);
      assert.equal(level, Logger.getLevel());

      level = 'security';
      Logger.setLevel(level);
      assert.equal(level, Logger.getLevel());
    });

    test('should fail to change the log level if it is misspelled', () => {
      const level = 'trace';
      Logger.setLevel(level);
      assert.equal(level, Logger.getLevel());

      Logger.setLevel('truce');
      assert.equal(level, Logger.getLevel());
    });

    test('should create a new logger with .create', () => {
      const loggerName = 'my logger';
      const logger = Logger.create(loggerName);
      assert.equal(logger.name, loggerName);
      assert(logger instanceof Logger);
    });

    test('should have log level methods on logger object', () => {
      const logger = new Logger('a name');
      const levels = Logger.allLevels();
      assert.equal(levels.length, 6);
      levels.forEach((level) => {
        assert.equal(typeof logger[level], 'function');
      });
    });

    test('should respect the log level', () => {
      Logger.setLevel('security');
      const logger = new Logger('name');
      assert.equal(logger.trace(''), false);
      assert.equal(logger.security(''), true);
    });
  });

  describe('Log Messages', () => {
    test.skip('should log a complex string of params', (done) => {
      const msg = 'my message';
      const myArray = [1, 2, 3, 4, 5];
      const undef = undefined;
      const myObj = { one: 1, two: 'two' };
      const falsy = false;

      const mockLog = (logObj) => {
        expect(logObj.msg).toBe(msg);
        expect(logObj.myArray).toEqual(myArray);
        expect(logObj.myObj).toEqual(myObj);
        expect(logObj[0]).toBeUndefined();
        expect(logObj[1]).toBe(false);
        done();
      };

      jest.mock('debug', () => () => mockLog);

      // eslint-disable-next-line global-require
      const Logger = require('../../../lib/logging/logger');

      Logger.setLevel('trace');
      const logger = new Logger('name');

      logger.trace(msg, { myArray }, { myObj }, undef, falsy);
    });
  });
});
