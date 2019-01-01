// The objective of this file is to provide strongly typed access to members of
// the Redux store.
//
// In the code, instead of writing:
// const users = store.getState().users;
//
// we would write:
// const storeHelper = require('../store-helper');
// const users = storeHelper.getUsers();
//
// Now users will be strongly typed

/**
 * @param {import('redux').Store} store
 * @returns {UiInterim}
 */
const getInterim = store => store.getState().interim;

/**
 * @param {import('redux').Store} store
 * @returns {UiLocations}
 */
const getLocations = store => store.getState().locations;

/**
 * @param {import('redux').Store} store
 * @returns {UiNotes}
 */
const getNotes = store => store.getState().notes;

/**
 * @param {import('redux').Store} store
 * @returns {UiPlants}
 */
const getPlants = store => store.getState().plants;

/**
 * @param {import('redux').Store} store
 * @returns {UiUser}
 */
const getUser = store => store.getState().user;

/**
 * @param {import('redux').Store} store
 * @returns {UiUsers}
 */
const getUsers = store => store.getState().users;

module.exports = {
  getInterim,
  getLocations,
  getNotes,
  getPlants,
  getUser,
  getUsers,
};
