const { actionEnum } = require('../../../app/actions');
const helper = require('../../helper');

/**
 * @param {import("redux").Store} store
 * @param {AjaxOptions} options
 */
// eslint-disable-next-line no-unused-vars
let ajax = (store, options) => {};
/**
 * @param {import("redux").Store} store
 * @param {AjaxOptions} options
 */
const mockAjax = (store, options) => {
  ajax(store, options);
};

jest.mock('../../../app/middleware/ajax', () => mockAjax);

const api = require('../../../app/middleware/api');

describe('/app/middleware/api', () => {
  test('should check that functions/url exist', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const store = helper.getFakeStore();
    const next = () => {};
    let callCounter = 0;

    ajax = (state, options) => {
      expect(typeof options.url).toBe('string');
      expect(options.success).toBeInstanceOf(Function);
      expect(options.failure).toBeInstanceOf(Function);
      callCounter += 1;
    };

    Object.keys(api.apis).forEach((key) => {
      const action = {
        payload: {
          _id: '123',
          plantIds: ['123'], // To make loadNotesRequest work
          plantId: '123', // To make deletePlantRequest work
        },
      };

      api(store)(next)({ ...action, type: key });
    });

    expect(callCounter).toBe(Object.keys(api.apis).length);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  test(
    'should check that upsertNoteRequest calls saveNoteRequest when files is present',
    () => {
      const store = helper.getFakeStore();
      const next = () => {};
      let callCounter = 0;
      ajax = (state, options) => {
        expect(options.contentType).toBe('multipart/form-data');
        expect(options.data.append).toBeInstanceOf(Function);
        expect(options.failure).toBeInstanceOf(Function);
        expect(options.success).toBeInstanceOf(Function);
        expect(options.type).toBe('POST');
        expect(options.url).toBe('/api/upload');
        expect(options.fileUpload).toBe(true);
        callCounter += 1;
      };

      const action = {
        payload: {
          note: { _id: '123' },
          files: [{}],
        },
        type: actionEnum.UPSERT_NOTE_REQUEST,
      };

      api(store)(next)(action);

      expect(callCounter).toBe(1);
    },
  );

  test('should check that next gets called if no match', () => {
    const store = helper.getFakeStore();
    const action = {
      payload: { _id: '123' },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    api(store)(next)({ ...action, type: 'Does not exist' });

    expect(nextCalled).toBe(true);
  });
});
