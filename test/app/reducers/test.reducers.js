import rootReducer from '../../../app/reducers';
import * as actions from '../../../app/actions';
import assert from 'assert';

describe('/app/reducers', function() {

  it('should reduce a logout action', (done) => {
    const expected = {
      notes: {},
      plants: {},
      user: {},
      users: {}
    };
    const actual = rootReducer({}, actions.logout());
    assert.deepEqual(actual, expected);
    done();
  });

});
