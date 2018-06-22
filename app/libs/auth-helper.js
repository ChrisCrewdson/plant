const getIn = require('lodash/get');

function isOwner(object, store) {
  const { user } = store.getState();
  const { jwt, _id } = user || {};

  const owner = user && jwt && _id && object
    // owner is true if no _id (creating) and user is logging in
    && (object.userId === _id || !object._id);
  return !!owner;
}

function isLoggedIn(store) {
  const { user } = store.getState();
  const { isLoggedIn: loggedIn } = user || {};
  return !!(user && loggedIn);
}

/**
 * Returns true or false if the user is able to edit plants at this location.
 * @param {string} loggedInUserId - the id of the user that is logged in
 * @param {ImmutableJS.Map} location - an ImmutableJS Map of the location object
 */
function canEdit(loggedInUserId, location) {
  if (!loggedInUserId || !location) {
    return false;
  }
  const role = getIn(location, ['members', loggedInUserId]);
  if (!role) {
    return false;
  }
  // TODO: Change to consts below and also create a method for this comparison
  // i.e. what is an owner vs manager vs member allowed to do?
  return role === 'owner' || role === 'manager';
}

module.exports = {
  canEdit,
  isLoggedIn,
  isOwner,
};
