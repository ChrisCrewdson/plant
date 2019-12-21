import getIn from 'lodash/get';
import { Store } from 'redux';

export function isLoggedIn(store: Store): boolean {
  const { user } = store.getState();
  const { isLoggedIn: loggedIn = false } = user || {};
  return !!(user && loggedIn);
}

/**
 * Returns true or false if the user is able to edit plants at this location.
 * @param loggedInUserId - the id of the user that is logged in
 * @param location - an Object of the location
 */
export function canEdit(
  loggedInUserId: (string | null) | undefined, location: UiLocationsValue | null,
): boolean {
  if (!loggedInUserId || !location) {
    return false;
  }
  const role: Role | null = getIn(location, ['members', loggedInUserId]);
  if (!role) {
    return false;
  }
  return role === 'owner' || role === 'manager';
}
