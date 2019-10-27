import { produce } from 'immer';
import * as helper from '../../helper';
import * as authHelper from '../../../app/libs/auth-helper';

describe('/app/libs/auth-helper', () => {
  describe('canEdit', () => {
    test('should return false if loggedInUserId is falsy', () => {
      expect(authHelper.canEdit(undefined, null)).toBe(false);
    });

    test('should return false if location is falsy', () => {
      expect(authHelper.canEdit('fake-user-id', null)).toBe(false);
    });

    test('should return false if location does not have member', () => {
      const location = produce({}, (draft) => draft) as UiLocationsValue;
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return false if member is not owner/manager', () => {
      const location = produce({
        members: {
          'fake-user-id': 'not-owner-manager',
        },
      }, (draft) => draft) as unknown as UiLocationsValue;
      expect(authHelper.canEdit('fake-user-id', location)).toBe(false);
    });

    test('should return true if member is owner', () => {
      const location = produce({
        members: {
          'fake-user-id': 'owner',
        },
      }, (draft) => draft) as unknown as UiLocationsValue;
      expect(authHelper.canEdit('fake-user-id', location)).toBe(true);
    });

    test('should return true if member is manager', () => {
      const location = produce({
        members: {
          'fake-user-id': 'manager',
        },
      }, (draft) => draft) as unknown as UiLocationsValue;
      expect(authHelper.canEdit('fake-user-id', location)).toBe(true);
    });
  });

  describe('isLoggedIn', () => {
    test('should return false if user is not logged in', () => {
      const store = helper.getFakeStore();
      store.getState = () => produce({
        user: {},
      }, (draft) => draft);
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });

    test('should return false if user is missing from state', () => {
      const store = helper.getFakeStore();
      store.getState = () => produce({}, (draft) => draft);
      expect(authHelper.isLoggedIn(store)).toBe(false);
    });
  });
});
