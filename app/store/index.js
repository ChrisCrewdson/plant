const { createStore, applyMiddleware } = require('redux');
const reducers = require('../reducers'); // combineReducers already called on reducers in her)e
const api = require('../middleware/api');
const { setupSubscribe: userSubscribe } = require('./user');
const seamless = require('seamless-immutable').static;

const middleware = [api];

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const logger = require('../middleware/logger');
  middleware.unshift(logger);
}

// Add the api to the pipeline/chain
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

const store = createStoreWithMiddleware(reducers, Immutable.fromJS(window.__INITIAL_STATE__ || {}));

userSubscribe(store);

module.exports = store;
