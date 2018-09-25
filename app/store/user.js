// Purpose: Keep localStorage up-to-date with changes in the user object.

// 1. Listen to state changes.
// 2. If the user object has changed then write to localStorage
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;

/** @type {UiUser} */
let user;

/**
 * setup the subscription
 * @param {import('redux').Store} store
 */
function setupSubscribe(store) {
  let currentValue = user || seamless.from({});

  function handleChange() {
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

function initialState() {
  if (!user) {
    try {
      const localStorageUser = localStorage.getItem('user');
      if (localStorageUser) {
        user = JSON.parse(localStorageUser);
      }
    // eslint-disable-next-line no-empty
    } catch (e) {
    }
    user = seamless.from(user || {});
  }

  return user;
}

module.exports = {
  initialState,
  setupSubscribe,
};
