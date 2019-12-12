import _ from 'lodash';
import * as validators from '../../../app/models';
import * as constants from '../../../app/libs/constants';
import utils from '../../../app/libs/utils';

const { makeMongoId } = utils;
const { note: noteValidator } = validators;

describe('/app/models/note', () => {
  describe('basic validation', () => {
    test('should pass minimum validation', () => {
      const note: BizNote = {
        _id: '5c77545608a6cd11fdb0ca86',
        date: 20160101,
        plantIds: ['5c77545608a6cd11fdb0ca87'],
        note: 'some text',
        userId: makeMongoId(),
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(transformed).toMatchSnapshot();
      expect(noteCopy).toEqual(note);
    });

    test('should fail validation', () => {
    // All items in note should be invalid
      const note = {
        _id: '0e55d91cb33d42', // Not a MongoId
        date: 'Not a Number',
        plantIds: ['9ec5c8ffcf885bf'], // Not a MongoId in array
        note: {}, // not a string
      } as unknown as BizNote;

      const noteCopy = _.cloneDeep(note);

      try {
        noteValidator(note);
      } catch (err) {
        expect(err).toMatchSnapshot();
        expect(noteCopy).toEqual(note);
      }
      expect.assertions(2);
    });

    test('should strip out props not in the schema', () => {
      const note = {
        _id: '5c2aefa2da47a52adc1c4651',
        date: 20160101,
        fakeName1: 'Common Name',
        fakeName2: 'Description',
        note: 'some text',
        plantId: 'fake plant id',
        plantIds: ['5c2aefa687358b2af50246d6'],
        userId: 'fake user id',
      } as BizNote;

      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(noteCopy).toEqual(note); // no mutation of original note

      expect(transformed).toMatchSnapshot();
    });

    test('should add _id if it is a new record', () => {
      const note: BizNote = {
        date: 20160101,
        plantIds: ['5c2aefa687358b2af50246d6'],
        note: 'some text',
      } as BizNote;
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(noteCopy).toEqual(note);

      expect(transformed.plantIds).toEqual(note.plantIds);

      expect(transformed).toMatchSnapshot({
        _id: expect.stringMatching(constants.mongoIdRE),
      });
    });

    test('should fail if plantIds is empty', (done) => {
      const note: BizNote = {
        _id: '5c2aefa687358b2af50246d6',
        date: 20160101,
        note: 'some text',
        plantIds: [],
        userId: 'fake user id',
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
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        note: 'some text',
      } as unknown as BizNote;
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        note: 'some text',
        plantIds: makeMongoId(),
      } as unknown as BizNote;
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
    const image: NoteImage = {
      ext: 'jpg',
      id: '5c2af2b712d4132fa1e69d3a',
      originalname: 'apple tree',
      size: 123456,
      sizes: [],
    };

    test('should pass with an empty images array', () => {
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [],
        note: 'some text',
        plantIds: [makeMongoId()],
        userId: 'fake user id',
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: 'some text',
        plantIds: [makeMongoId()],
        userId: 'fake user id',
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: '',
        plantIds: [makeMongoId()],
        userId: 'fake user id',
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        plantIds: [makeMongoId()],
        userId: 'fake user id',
      };
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);
      expect(Object.keys(transformed)).toHaveLength(4);
      expect(transformed._id).toBe(note._id);
      expect(transformed.userId).toBeUndefined();
      expect(noteCopy).toEqual(note);
    });

    test('should fail if images is not an array', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: makeMongoId(),
        note: 'some text',
        plantIds: [makeMongoId()],
      } as unknown as BizNote;
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
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [{ ...image, id: 123 }],
        note: 'some text',
        plantIds: [makeMongoId()],
      } as unknown as BizNote;
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [{ ...image, id: '123' }],
        note: 'some text',
        plantIds: [makeMongoId()],
        userId: 'fake user id',
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
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [{ ...image, originalname: 123 }],
        note: 'some text',
        plantIds: [makeMongoId()],
      } as unknown as BizNote;
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
      const note = {
        _id: '5c2af2b712d4132fa1e69d39',
        date: 20160101,
        images: [{ ...image, size: '123' }],
        note: 'some text',
        plantIds: ['5c2af2b712d4132fa1e69d38'],
      } as unknown as BizNote;
      const noteCopy = _.cloneDeep(note);

      const transformed = noteValidator(note);

      expect(transformed).toMatchSnapshot();
      expect(noteCopy).toEqual(note);
    });

    test('should fail if images ext is longer than 20', (done) => {
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [{ ...image, ext: '123456789012345678901' }],
        note: 'some text',
        plantIds: [makeMongoId()],
        userId: 'fake user id',
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
      const note: BizNote = {
        _id: makeMongoId(),
        date: 20160101,
        images: [{ ...image, extra: 'jpg' }],
        note: 'some text',
        plantIds: [makeMongoId()],
      } as unknown as BizNote;
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
