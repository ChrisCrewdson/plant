import {
  Action,
  Dispatch,
  Store,
} from 'redux';

/* eslint-disable no-console */
export const logger = (store: Store): Function => (next: Dispatch) => (action: Action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.info('next state', store.getState());
  console.groupEnd();
  return result;
};
/* eslint-enable no-console */
