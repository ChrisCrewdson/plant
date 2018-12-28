
const storeHelper = require('../../../app/libs/store-helper');

const stores = [
  'interim',
  'locations',
  'notes',
  'plants',
  'users',
  'users',
];

const mockStates = stores.reduce((acc, store) => {
  acc[store] = store;
  return acc;
}, /** @type {Dictionary<string>} */ ({}));

/** @type {import('redux').Store} */
// @ts-ignore - this is a mock store for testing so some of the props are missing
const mockStore = {
  getState: () => mockStates,
};

describe('/app/libs/store-helper', () => {
  stores.forEach((store) => {
    test(`should get store - ${store}`, () => {
      const method = `get${store[0].toUpperCase()}${store.slice(1)}`;
      const innerStore = storeHelper[method](mockStore);
      expect(innerStore).toBe(store);
    });
  });
});
