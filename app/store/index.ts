import { produce } from 'immer';
import {
  createStore, applyMiddleware, Middleware, Store,
} from 'redux';

import reducers from '../reducers'; // combineReducers already called on reducers in her)e
import { api } from '../middleware/api';

import { logger } from '../middleware/logger';
import { setupSubscribe as userSubscribe } from './user';
import { PlantAction } from '../../lib/types/redux-payloads';
import utils from '../libs/utils';

const { getGlobalThis } = utils;
const middleware = [api] as Middleware<any, any, any>[];

if (process.env.NODE_ENV !== 'production') {
  middleware.unshift(logger as Middleware<any, any, any>);
}

// Add the api to the pipeline/chain
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

const globThis = getGlobalThis() as { __INITIAL_STATE__?: object };
const initialState = produce({}, () => (globThis.__INITIAL_STATE__ || {}));
const store = createStoreWithMiddleware(reducers, initialState) as Store<PlantStateTree,
PlantAction>;

userSubscribe(store);

export default store;
