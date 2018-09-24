const { createStore, applyMiddleware } = require('redux');
// @ts-ignore - static hasn't been defined on seamless types yet.
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

const initialState = seamless.from(window.__INITIAL_STATE__ || {});
const store = createStoreWithMiddleware(reducers, initialState);

userSubscribe(store);

module.exports = store;
