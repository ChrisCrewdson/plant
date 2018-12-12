const helper = require('../../helper');

/** @type {number} */
let ajaxCallCounter;
/** @type {JQueryAjaxSettings} */
let opts;
jest.mock('jquery', () => ({
  count: 0,
  /**
   * @param {JQueryAjaxSettings} options
   */
  ajax: (options) => {
    ajaxCallCounter += 1;
    opts = options;
  },
}));

const ajax = require('../../../app/middleware/ajax');

describe('/app/middleware/ajax', () => {
  test('should return an object if data is object', (done) => {
    /** @type {import("redux").Store} */
    const store = helper.getFakeStore();
    const options = {
      url: '/something',
      success: () => {},
      failure: () => {},
      data: {},
      type: 'POST',
    };

    ajaxCallCounter = 0;

    ajax(store, options);

    expect(ajaxCallCounter).toBe(1);
    expect(opts.url).toBe(options.url);
    expect(opts.type).toBe(options.type);

    done();
  });

  test('should not change a native data type', (done) => {
    /** @type {import("redux").Store} */
    const store = helper.getFakeStore();
    const data = 'do not change me';
    const options = {
      url: '/something',
      success: () => {},
      failure: () => {},
      data,
      type: 'POST',
    };

    ajaxCallCounter = 0;

    ajax(store, options);

    expect(ajaxCallCounter).toBe(1);
    expect(opts.url).toBe(options.url);
    expect(opts.type).toBe(options.type);
    expect(opts.data).toBe(data);

    done();
  });
});
