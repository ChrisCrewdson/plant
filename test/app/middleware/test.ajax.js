const _ = require('lodash');
const assert = require('assert');

// const logger = require('../../../lib/logging/logger').create('test.ajax');

const ajaxStub = {
  jquery: {},
};

let callCounter = 0;
jest.mock('jquery', {
  count: 0,
  ajax: () => {
    callCounter += 1;
  },
});

const ajax = require('../../../app/middleware/ajax');

describe('/app/middleware/ajax', () => {
  test('should return an object if data is object', (done) => {
    const store = {};
    const options = {
      url: '/something',
      success: () => {},
      failure: () => {},
      data: {},
      type: 'POST',
    };

    let jqueryAjaxCalled = false;

    ajaxStub.jquery.ajax = (opts) => {
      assert(_.isObject(opts.data));
      jqueryAjaxCalled = true;
    };

    ajax(store, options);
    expect(callCounter).toBe(1);

    assert(jqueryAjaxCalled);

    done();
  });

  test('should not change a native data type', (done) => {
    const store = {};
    const options = {
      url: '/something',
      success: () => {},
      failure: () => {},
      data: 'do not change me',
      type: 'POST',
    };

    let jqueryAjaxCalled = false;

    ajaxStub.jquery.ajax = (opts) => {
      assert.equal(opts.data, 'do not change me');
      jqueryAjaxCalled = true;
    };

    ajax(store, options);

    assert(jqueryAjaxCalled);

    done();
  });
});
