import {
  Action,
  Dispatch,
  Store,
} from 'redux';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

/* eslint-disable no-console */
const logger = (store: Store): Function => (next: Dispatch) => (action: Action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.info('next state', store.getState());
  console.groupEnd();
  return result;
};
/* eslint-enable no-console */

module.exports = logger;
