/* eslint-disable no-console */
const logger = store => next => (action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.info('next state', store.getState());
  console.groupEnd(action.type);
  return result;
};
/* eslint-enable no-console */

module.exports = logger;
