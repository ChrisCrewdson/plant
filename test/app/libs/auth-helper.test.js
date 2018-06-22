const seamless = require('seamless-immutable').static;
const authHelper = require('../../../app/libs/auth-helper');

describe('/app/libs/auth-helper', () => {
  describe('isOwner', () => {
    test('should return true with matching userIds', () => {
      const store = {
        getState: () => ({ user: { jwt: true, _id: 'u-1' } }),
      };
      const obj = {
        userId: 'u-1',
      };
      const owner = authHelper.isOwner(obj, store);
      expect(owner).toBe(true);
    });

    test('should return true with non-matching userIds and missing _id', () => {
      const store = {
        getState: () => ({ user: { jwt: true, _id: 'u-2' } }),
      };
      const obj = {
        userId: 'u-1',
      };
      const owner = authHelper.isOwner(obj, store);
      expect(owner).toBe(true);
    });

    test('should return false if no user object on store', () => {
      const store = {
        getState: () => ({ }),
      };
      const obj = {
        userId: 'u-1',
      };
      const owner = authHelper.isOwner(obj, store);
      expect(owner).toBe(false);
    });
  });

  describe('canEdit', () => {
    test('should return false if loggedInUserId is falsy', () => {
      expect(authHelper.canEdit()).toBe(false);
    });

    test('should return false if location is falsy', () => {
      expect(authHelper.canEdit('fake-user-id')).toBe(false);
    });

    test('should return false if location does not have member', () => {
      const location = seamless.from({});
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return false if member is not owner/manager', () => {
      const location = seamless.from({
        members: {
          'fake-user-id': 'not-owner-manager',
        },
      });
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return true if member is owner', () => {
      const location = seamless.from({
        members: {
          'fake-user-id': 'owner',
        },
      });
      expect(authHelper.canEdit('fake-user-id', location)).toBe(true);
    });

    test('should return true if member is manager', () => {
      const location = seamless.from({
        members: {
          'fake-user-id': 'manager',
        },
      });
      expect(authHelper.canEdit('fake-user-id', location)).toBe(true);
    });
  });

  describe('isLoggedIn', () => {
    test('should return false if user is not logged in', () => {
      const store = {
        getState: () => seamless.from({
          user: {},
        }),
      };
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });

    test('should return false if user is missing from state', () => {
      const store = {
        getState: () => seamless.from({}),
      };
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });
  });
});
