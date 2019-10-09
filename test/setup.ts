import { RequestOptions } from 'http';
import oauth2, { dataCallback } from 'oauth';

import uuid from 'uuid';

import * as createOptions from '../lib/db/mongo/schema';
import { requests } from './fixtures/google-oauth';
import { mockLogger } from './mock-logger';
import { getDbInstance } from '../lib/db/mongo';

/** @type {Global} */
const globalAny = global;

const googleOAuth = requests;
const mongo = getDbInstance;

jest.setTimeout(60000); // 60 second timeout

// eslint-disable-next-line import/no-extraneous-dependencies

// @ts-ignore - _executeRequest is protected - we're deliberately doing this for testing
// eslint-disable-next-line operator-linebreak
oauth2.OAuth2.prototype._executeRequest = function _executeRequest(_httpLibrary: string,
  options: RequestOptions, postBody: any, callback: dataCallback) {
  const { host } = options;
  if (!host) {
    throw new Error('Expecting host to be truthy');
  }
  const request = googleOAuth[host];
  if (!request) {
    throw new Error(`Expecting request to be truthy ${host}`);
  }
  // @ts-ignore - in the oauth code this callback can be called with null
  callback(null, JSON.stringify(request.result));
};

process.env.TESTING = 'true';


// Create a unique database name in the setup file because there
// may be multiple workers running tests and each worker will
// need a unique DB so that when all collections are deleted
// during a test setup other workers are not impacted.
const dbName = `plant-test-${uuid.v4()}`;
const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${dbName}`;
const mongoDb = mongo(mongoConnection);

beforeAll(async () => {
  const db = await mongoDb.GetDb(mockLogger);
  // Add jsonSchema validation to collections in DB.
  // At the time of writing this Feb 2019 the schema validation was
  // only being added here and is experimental and not added to the prod DB.
  const { plant, location } = createOptions;
  await db.createCollection('plant', plant);
  // await db.createCollection('note', note);
  await db.createCollection('location', location);
});

/**
 * React will print a warning to the console if it cannot find requestAnimationFrame()
 * warning(false, 'React depends on requestAnimationFrame. Make sure that you load a ' +
 * 'polyfill in older browsers. http://fb.me/react-polyfills');
 */
// @ts-ignore - requestAnimationFrame no on global
globalAny.requestAnimationFrame = (callback: Function) => {
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
/**
 * @param {object} win
 */
function propagateToGlobal(win: { [x: string]: any }) {
  Object.keys(win).forEach((key) => {
    // @ts-ignore No index signature with a parameter of type 'string' was found on type 'Global'.
    if (!globalAny[key]) {
      // @ts-ignore No index signature with a parameter of type 'string' was found on type 'Global'.
      globalAny[key] = win[key];
    }
  });
}

// Source: https://github.com/jesstelford/react-testing-mocha-jsdom
// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
document.body.innerHTML = '<!doctype html><html><body></body></html>';

// global.window = document.parentWindow;
/** @type {Window} */
// @ts-ignore - window not on global
globalAny.window = document.defaultView as Window;

// @ts-ignore - window not on global
globalAny.window.FormData = function appender() {
  this.append = () => {};
};

// global.navigator = {
//   userAgent:
//     'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)
//      Chrome/49.0.2454.85 Safari/537.36'
// };
// @ts-ignore - not on global
globalAny.navigator = globalAny.window.navigator;
// @ts-ignore - window not on global
propagateToGlobal(globalAny.window);

afterAll(async () => {
  const db = await mongoDb.GetDb(mockLogger);
  await db.dropDatabase();
  const client = mongoDb.getDbClient();
  if (!client) {
    // eslint-disable-next-line no-console
    console.error(`client is falsy in setup/afterAll() ${client}`);
    return;
  }
  await client.close();
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
