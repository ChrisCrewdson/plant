import { Store } from 'redux';
import { produce } from 'immer';
import { PlantAction } from '../../lib/types/redux-payloads';

// Purpose: Keep localStorage up-to-date with changes in the user object.

// 1. Listen to state changes.
// 2. If the user object has changed then write to localStorage

let user: UiUser;

/**
 * setup the subscription
 */
export function setupSubscribe(store: Store<PlantStateTree, PlantAction>): void {
  let currentValue = user || produce({}, (draft) => draft);

  function handleChange(): void {
    const previousValue = currentValue;
    currentValue = store.getState().user;

    if (previousValue !== currentValue) {
      localStorage.setItem('user', JSON.stringify(currentValue));
    }
  }

  // let unsubscribe = store.subscribe(handleChange);
  // Will not need to unsubscribe until app shuts down.
  store.subscribe(handleChange);
}

export function initialState(): UiUser {
  if (!user) {
    try {
      const localStorageUser = localStorage.getItem('user');
      if (localStorageUser) {
        user = JSON.parse(localStorageUser);
      }
    // eslint-disable-next-line no-empty
    } catch (e) {
    }
    user = produce({}, () => (user || {}));
  }

  return user;
}
