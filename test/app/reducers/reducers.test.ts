import si from 'seamless-immutable';
import rootReducer from '../../../app/reducers';
import { actionFunc } from '../../../app/actions';

import { reducers as interimReducers } from '../../../app/reducers/interim';
import { reducers as locationsReducers } from '../../../app/reducers/locations';
import { reducers as notesReducers } from '../../../app/reducers/notes';
import { reducers as plantsReducers } from '../../../app/reducers/plants';
import { reducers as userReducers } from '../../../app/reducers/user';
import { reducers as usersReducers } from '../../../app/reducers/users';

const reducerModules = [
  interimReducers,
  locationsReducers,
  notesReducers,
  plantsReducers,
  userReducers,
  usersReducers,
];

// @ts-ignore
const seamless = si.static;

describe('/app/reducers', () => {
  test('should reduce a logout success', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutSuccess());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout request', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutRequest());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout failure', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutFailure());
    expect(actual).toMatchSnapshot();
  });

  describe('sanity check all reducers', () => {
    reducerModules
      .forEach((reducerMap) => {
        test(`${reducerMap} should not have an undefined reducer`, () => {
          expect(reducerMap).toBeInstanceOf(Object);
          expect(reducerMap.undefined).toBeUndefined();
          Object.keys(reducerMap).forEach((reducerKey) => {
            const value = reducerMap[reducerKey];
            expect(value).toBeInstanceOf(Function);
          });
        });
      });
  });
});
