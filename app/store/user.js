// Purpose: Keep localStorage up-to-date with changes in the user object.

// 1. Listen to state changes.
// 2. If the user object has changed then write to localStorage
const seamless = require('seamless-immutable').static;

let user;
function setupSubscribe(store) {
  let currentValue = user || Immutable.Map();

  function handleChange() {
    const previousValue = currentValue;
    currentValue = store.getState().get('user');

    if (!previousValue.equals(currentValue)) {
      localStorage.setItem('user', JSON.stringify(currentValue.toJS()));
    }
  }

  // let unsubscribe = store.subscribe(handleChange);
  // Will not need to unsubscribe until app shuts down.
  store.subscribe(handleChange);
}

function initialState() {
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('user'));
    // eslint-disable-next-line no-empty
    } catch (e) {
    }
    user = Immutable.fromJS(user || {});
  }

  return user;
}

module.exports = {
  initialState,
  setupSubscribe,
};
