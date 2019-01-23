const _ = require('lodash');
const validators = require('../../../app/models');
const constants = require('../../../app/libs/constants');
const utils = require('../../../app/libs/utils');

const { makeMongoId } = utils;
const { note: noteValidator } = validators;

describe('/app/models/note', () => {
  describe('basic validation', () => {
    test('should pass minimum validation', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        plantIds: [makeMongoId()],
        note: 'some text',
        userId: makeMongoId(),
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(transformed.note).toBe(note.note);
      expect(noteCopy).toEqual(note);
    });

    test('should fail validation', () => {
    // All items in note should be invalid
      /** @type {UiInterimNote} */
      const note = {
        _id: '0e55d91cb33d42', // Not a MongoId
        // @ts-ignore - intentionally mistyping for testing
        date: 'Not a Number',
        plantIds: ['9ec5c8ffcf885bf'], // Not a MongoId in array
        // @ts-ignore - intentionally mistyping for testing
        note: {}, // not a string
      };

      const noteCopy = _.cloneDeep(note);

      /* eslint-disable no-console */
      console.error = jest.fn();
      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();

        expect(err._id).toBe(' id is invalid');
        expect(err.date).toBe('Date must be a number');
        expect(err.plantIds).toBe('Plant ids must be MongoIds');
        expect(noteCopy).toEqual(note);
        expect(console.error).toHaveBeenCalledTimes(1);
      }
      // @ts-ignore - mockReset does not existing on console.error
      console.error.mockReset();
      /* eslint-enable no-console */
      expect.assertions(6);
    });

    test('should strip out props not in the schema', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: '5c2aefa2da47a52adc1c4651',
        date: 20160101,
        plantIds: ['5c2aefa687358b2af50246d6'],
        note: 'some text',
        // @ts-ignore - intentionally mistyped for testing
        fakeName1: 'Common Name',
        fakeName2: 'Description',
        plantId: 'fake plant id',
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(noteCopy).toEqual(note); // no mutation of original note

      expect(transformed).toMatchSnapshot();
    });

    test('should add _id if it is a new record', () => {
      /** @type {UiInterimNote} */
      const note = {
        date: 20160101,
        plantIds: ['5c2aefa687358b2af50246d6'],
        note: 'some text',
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(noteCopy).toEqual(note);

      expect(transformed.plantIds).toEqual(note.plantIds);

      expect(transformed).toMatchSnapshot({
        _id: expect.stringMatching(constants.mongoIdRE),
      });
    });

    test('should fail if plantIds is empty', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: '5c2aefa687358b2af50246d6',
        date: 20160101,
        plantIds: [],
        note: 'some text',
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.plantIds).toBe('You must select at least 1 plant for this note.');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if plantIds is missing', (done) => {
      /** @type {UiInterimNote} */
      // @ts-ignore - intentionally mistyped for testing
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        note: 'some text',
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.plantIds).toBe('Plant ids is required');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if plantIds is not an array', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        note: 'some text',
        // @ts-ignore - intentionally mistyped for testing
        plantIds: makeMongoId(),
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.plantIds).toBe('Plant ids must be an array');
        expect(noteCopy).toEqual(note);
        done();
      }
    });
  });

  describe('metric validation', () => {

  });

  describe('note.model/images validation', () => {
    /** @type {NoteImage} */
    const image = {
      ext: 'jpg',
      id: '5c2af2b712d4132fa1e69d3a',
      originalname: 'apple tree',
      size: 123456,
      sizes: [],
    };

    test('should pass with an empty images array', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);


      const transformed = noteValidator(note);
      expect(Object.keys(transformed)).toHaveLength(5);
      expect(transformed._id).toBe(note._id);
      expect(transformed.note).toBe(note.note);
      expect(transformed.userId).toBeUndefined();
      expect(noteCopy).toEqual(note);
    });

    test('should pass with valid images', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(Object.keys(transformed)).toHaveLength(5);
      expect(transformed._id).toBe(note._id);
      expect(transformed.note).toBe(note.note);
      expect(transformed.userId).toBeUndefined();
      expect(noteCopy).toEqual(note);
    });

    test('should pass with valid images and an empty note', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: '',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(Object.keys(transformed)).toHaveLength(5);
      expect(transformed._id).toBe(note._id);
      expect(transformed.note).toBe(note.note);
      expect(transformed.userId).toBeUndefined();
      expect(noteCopy).toEqual(note);
    });

    test('should pass with valid images and a missing note', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(Object.keys(transformed)).toHaveLength(4);
      expect(transformed._id).toBe(note._id);
      expect(transformed.userId).toBeUndefined();
      expect(noteCopy).toEqual(note);
    });

    test('should fail if images is not an array', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        // @ts-ignore - intentionally mistyped for testing
        images: makeMongoId(),
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.images).toBe('Images must be an array');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if images id is not a mongoId', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { id: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.images).toBe('Images must be valid image objects');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if images ext is not a string', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { id: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.images).toBe('Images must be valid image objects');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if images originalname is not a string', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { originalname: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.images).toBe('Images must be valid image objects');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should convert image size if it is a string number', () => {
      /** @type {UiInterimNote} */
      const note = {
        _id: '5c2af2b712d4132fa1e69d39',
        date: 20160101,
        images: [Object.assign({}, image, { size: '123' })],
        note: 'some text',
        plantIds: ['5c2af2b712d4132fa1e69d38'],
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(transformed).toMatchSnapshot();
      expect(noteCopy).toEqual(note);
    });

    test('should fail if images ext is longer than 20', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { ext: '123456789012345678901' })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toBeTruthy();
        expect(err.images).toBe('Images must be valid image objects');
        expect(noteCopy).toEqual(note);
        done();
      }
    });

    test('should fail if images has extra props', (done) => {
      /** @type {UiInterimNote} */
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { extra: 'jpg' })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toMatchSnapshot();
        expect(noteCopy).toEqual(note);
        done();
      }
    });
  });
});
