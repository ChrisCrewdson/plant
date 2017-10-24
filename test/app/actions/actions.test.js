// const _ = require('lodash');
const actions = require('../../../app/actions');

describe('/app/actions', () => {
  test('should create a logout action', (done) => {
    const expected = {
      type: actions.LOGOUT,
    };
    const actual = actions.logout();
    expect(actual).toEqual(expected);
    done();
  });

  test('should create a login request action', (done) => {
    const payload = { one: 1, two: 2 };
    const expected = {
      type: actions.LOGIN_REQUEST,
      payload,
    };
    const actual = actions.loginRequest(payload);
    expect(actual).toEqual(expected);
    done();
  });

  test('should create a login failure action', (done) => {
    const payload = { one: 1, two: 2 };
    const expected = {
      type: actions.LOGIN_FAILURE,
      payload,
      error: true,
    };
    const actual = actions.loginFailure(payload);
    expect(actual).toEqual(expected);
    done();
  });
});
