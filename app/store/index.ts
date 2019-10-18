import si from 'seamless-immutable';
import {
  createStore, applyMiddleware, Middleware, Store, AnyAction,
} from 'redux';

import reducers from '../reducers'; // combineReducers already called on reducers in her)e
import { api } from '../middleware/api';

import { logger } from '../middleware/logger';
import { setupSubscribe as userSubscribe } from './user';

// @ts-ignore
const seamless = si.static;

const middleware = [api] as Middleware<any, any, any>[];

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  middleware.unshift(logger as Middleware<any, any, any>);
}

// Add the api to the pipeline/chain
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

// @ts-ignore - __INITIAL_STATE__ is added on the server
const initialState = seamless.from(window.__INITIAL_STATE__ || {});
const store = createStoreWithMiddleware(reducers, initialState);

userSubscribe(store as unknown as Store<any, AnyAction>);

export default store;
