import si from 'seamless-immutable';
import * as helper from '../../helper';
import * as authHelper from '../../../app/libs/auth-helper';

// @ts-ignore
const seamless = si.static;

describe('/app/libs/auth-helper', () => {
  describe('canEdit', () => {
    test('should return false if loggedInUserId is falsy', () => {
      // @ts-ignore - intentionally mistyping for testing
      expect(authHelper.canEdit()).toBe(false);
    });

    test('should return false if location is falsy', () => {
      // @ts-ignore - intentionally mistyping for testing
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
      const store = helper.getFakeStore();
      store.getState = () => seamless.from({
        user: {},
      });
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });

    test('should return false if user is missing from state', () => {
      const store = helper.getFakeStore();
      store.getState = () => seamless.from({});
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });
  });
});
