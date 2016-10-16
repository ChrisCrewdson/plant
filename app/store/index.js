const { createStore, applyMiddleware } = require('redux');
const reducers = require('../reducers'); // combineReducers already called on reducers in her)e
const api = require('../middleware/api');
const {setupSubscribe: userSubscribe} = require('./user');

let middleware = [api];

// if (process.env.NODE_ENV !== 'production') {
//   const logger = require('../middleware/logger');
//   middleware = [logger, api];
// }

const logger = require('../middleware/logger');
middleware = [logger, api];

// Add the api to the pipeline/chain
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

const store = createStoreWithMiddleware(reducers);

userSubscribe(store);

module.exports = store;
