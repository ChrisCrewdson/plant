const _ = require('lodash');
const uuid = require('uuid');

jest.setTimeout(60000); // 60 second timeout

// eslint-disable-next-line import/no-extraneous-dependencies
const oauth2 = require('oauth');
const googleOAuth = require('./fixtures/google-oauth');

// eslint-disable-next-line operator-linebreak
oauth2.OAuth2.prototype._executeRequest =
  function _executeRequest(httpLibrary, options, postBody, callback) {
    const { host } = options;
    if (!host) {
      throw new Error('Expecting host to be truthy');
    }
    const request = googleOAuth[host];
    if (!request) {
      throw new Error(`Expecting request to be truthy ${host}`);
    }
    callback(null, JSON.stringify(request.result));
  };

process.env.TESTING = true;

const loggerMockFunction = (errObj, extra) => {
  if (!_.isObject(errObj)) {
    throw new Error(`First param to lalog logger method is not an object: ${typeof errObj}`);
  }
  if (extra) {
    const { res, code } = extra;
    res.status(code).send({ one: 1 });
  }
};

global.loggerMock = {};

jest.mock('lalog', () => ({
  create: ({ serviceName, moduleName }) => {
    expect(serviceName).toBeTruthy();
    expect(moduleName).toBeTruthy();
    expect(typeof serviceName).toBe('string');
    expect(typeof moduleName).toBe('string');
    return global.loggerMock;
  },
  getLevel: () => 'info',
}));

const isObject = obj => obj !== null && typeof obj === 'object';

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

global.loggerMockReset = () => {
  // const levels = ['trace', 'info', 'warn', 'error', 'fatal', 'security'];
  global.loggerMock.trace = jest.fn(loggerMockFunction);
  global.loggerMock.info = jest.fn(loggerMockFunction);
  global.loggerMock.warn = jest.fn(loggerMockFunction);
  global.loggerMock.error = jest.fn(loggerMockFunction);
  global.loggerMock.fatal = jest.fn(loggerMockFunction);
  global.loggerMock.security = jest.fn(loggerMockFunction);
  global.loggerMock.timeEnd = jest.fn(loggerTimeEndMockFunction);
  global.loggerMock.timeEnd.error = jest.fn(loggerTimeEndMockFunction);
  global.loggerMock.time = jest.fn();
};

global.loggerMockReset();

const mongo = require('../lib/db/mongo');

// Create a unique database name in the setup file because there
// may be multiple workers running tests and each worker will
// need a unique DB so that when all collections are deleted
// during a test setup other workers are not impacted.
const dbName = `plant-test-${uuid.v4()}`;
const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${dbName}`;
const mongoDb = mongo(mongoConnection);

// React will print a warning to the console if it cannot find requestAnimationFrame()
// warning(false, 'React depends on requestAnimationFrame. Make sure that you load a ' +
// 'polyfill in older browsers. http://fb.me/react-polyfills');
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

process.env.PLANT_DB_NAME = 'plant-automated-testing';

process.env.PLANT_FB_ID = '<fake-fb-id>';
process.env.PLANT_FB_SECRET = '<fake-fb-secret>';
process.env.PLANT_GOOGLE_ID = '<fake-google-id>';
process.env.PLANT_GOOGLE_SECRET = '<fake-google-secret>';
process.env.PLANT_TOKEN_SECRET = '<fake-token-secret>';
process.env.PLANT_IMAGE_COMPLETE = 'fake-image-token';

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal(win) {
  Object.keys(win).forEach((key) => {
    if (!global[key]) {
      global[key] = win[key];
    }
  });
}

// Source: https://github.com/jesstelford/react-testing-mocha-jsdom
// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
document.body.innerHTML = '<!doctype html><html><body></body></html>';

// global.window = document.parentWindow;
global.window = document.defaultView;

global.window.FormData = function appender() {
  this.append = () => {};
};

// global.navigator = {
//   userAgent:
//     'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)
//      Chrome/49.0.2454.85 Safari/537.36'
// };
global.navigator = global.window.navigator;
propagateToGlobal(global.window);

// Weird that I was unable to mark the afterAll() callback as an
// async function. afterAll() didn't wait on it.
afterAll((done) => {
  async function cleanUp() {
    const db = await mongoDb.GetDb(global.loggerMock);
    db.dropDatabase();
    done();
  }
  cleanUp();
});

// These modules use 'ref' which causes problems with jest snapshot testing
// so mock them for all tests.
jest.mock('material-ui/TextField/EnhancedTextarea');
jest.mock('material-ui/internal/EnhancedSwitch');
jest.mock('material-ui/internal/Tooltip');
// For a Text input with multiLine set to true.
jest.mock('material-ui/TextField/EnhancedTextarea');
// jest.mock('react-dropzone', () => () => {});

jest.mock('react-dropzone', () => ({
  default: () => {},
}));
