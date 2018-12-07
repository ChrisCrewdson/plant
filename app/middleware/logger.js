/* eslint-disable no-console */
/**
 * @param {import('redux').Store} store
 * @returns {Function}
 */
// @ts-ignore - TODO: How does this get typed?
const logger = store => next => (action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.info('next state', store.getState());
  console.groupEnd();
  return result;
};
/* eslint-enable no-console */

module.exports = logger;
