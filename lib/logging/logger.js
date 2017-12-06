const _ = require('lodash');
const debug = require('debug');
const loggly = require('./loggly-wrapper')();

const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];

let currentLevelIndex = levels.indexOf('error');

class Logger {
  constructor(logName) {
    this.debug = debug(`plant:${logName}`);
    this.name = logName;
    levels.forEach((level, index) => {
      this[level] = this.write.bind(this, index);
    });
  }

  static create(logName) {
    return new Logger(logName);
  }

  static allLevels() {
    return levels;
  }

  static getLevel() {
    return levels[currentLevelIndex];
  }

  static setLevel(newLevelName) {
    const newLevelIndex = levels.indexOf(newLevelName);
    if (newLevelIndex >= 0) {
      currentLevelIndex = newLevelIndex;
    }
  }

  write(levelIndex, msg, ...args) {
    if (levelIndex >= currentLevelIndex) {
      const logObject = {
        level: levels[levelIndex],
        msg,
      };
      let counter = 0;

      if (args && args.length) {
        args.forEach((arg) => {
          if (_.isObject(arg) && !_.isArray(arg)) {
            Object.assign(logObject, arg);
          } else {
            logObject[counter] = arg;
            counter += 1;
          }
        });
      }

      loggly(logObject);
      this.debug(logObject);

      return true;
    }
    return false;
  }
}

module.exports = Logger;
