import {
  Dispatch,
  Store,
} from 'redux';
import { PlantAction } from '../../lib/types/redux-payloads';

/* eslint-disable no-console */
export const logger = (
  store: Store,
): Function => (next: Dispatch) => (action: PlantAction<any>): PlantAction<any> => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.info('next state', store.getState());
  console.groupEnd();
  return result;
};
/* eslint-enable no-console */
