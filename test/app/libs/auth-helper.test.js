const authHelper = require('../../../app/libs/auth-helper');
const seamless = require('seamless-immutable').static;

describe('/app/libs/auth-helper', () => {
  describe('canEdit', () => {
    test('should return false if loggedInUserId is falsy', () => {
      expect(authHelper.canEdit()).toBe(false);
    });

    test('should return false if location is falsy', () => {
      expect(authHelper.canEdit('fake-user-id')).toBe(false);
    });

    test('should return false if location does not have member', () => {
      const location = Immutable.fromJS({});
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return false if member is not owner/manager', () => {
      const location = Immutable.fromJS({
        members: {
          'fake-user-id': 'not-owner-manager',
        },
      });
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return true if member is owner', () => {
      const location = Immutable.fromJS({
        members: {
          'fake-user-id': 'owner',
        },
      });
      expect(authHelper.canEdit('fake-user-id', location)).toBe(true);
    });

    test('should return true if member is manager', () => {
      const location = Immutable.fromJS({
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
        getState: () => Immutable.fromJS({
          user: {},
        }),
      };
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });
  });
});
