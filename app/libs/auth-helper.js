const store = require('../store');

export function isOwner(object) {
  const {user} = store.getState().toJS();

  const owner = user && user.jwt && user._id && object &&
    // owner is true if no _id (creating) and user is logging in
    (object.userId === user._id || !object._id);
  return owner;
}

export function isLoggedIn() {
  const {user} = store.getState().toJS();
  return !!(user && user.isLoggedIn);
}
