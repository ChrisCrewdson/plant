export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const { createStore, applyMiddleware } = require('redux');

const seamless = require('seamless-immutable').static;
const reducers = require('../reducers'); // combineReducers already called on reducers in her)e
const api = require('../middleware/api');
const { setupSubscribe: userSubscribe } = require('./user');

const middleware = [api];

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const logger = require('../middleware/logger');
  middleware.unshift(logger);
}

// Add the api to the pipeline/chain
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

// @ts-ignore - __INITIAL_STATE__ is added on the server
const initialState = seamless.from(window.__INITIAL_STATE__ || {});
const store = createStoreWithMiddleware(reducers, initialState);

userSubscribe(store);

module.exports = store;
