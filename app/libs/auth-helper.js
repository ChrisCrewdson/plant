const getIn = require('lodash/get');

/**
 *
 * @param {import('redux').Store} store
 */
function isLoggedIn(store) {
  const { user } = store.getState();
  const { isLoggedIn: loggedIn = false } = user || {};
  return !!(user && loggedIn);
}

/**
 * Returns true or false if the user is able to edit plants at this location.
 * @param {string} loggedInUserId - the id of the user that is logged in
 * @param {Object} location - an Object of the location
 */
function canEdit(loggedInUserId, location) {
  if (!loggedInUserId || !location) {
    return false;
  }
  /**
   * @type Role
   */
  const role = getIn(location, ['members', loggedInUserId]);
  if (!role) {
    return false;
  }
  return role === 'owner' || role === 'manager';
}

module.exports = {
  canEdit,
  isLoggedIn,
};
