import si from 'seamless-immutable';
import reducers from '../reducers'; // combineReducers already called on reducers in her)e

const { createStore, applyMiddleware } = require('redux');

// @ts-ignore
const seamless = si.static;

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
