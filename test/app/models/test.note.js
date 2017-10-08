const _ = require('lodash');
const validators = require('../../../app/models');
const constants = require('../../../app/libs/constants');
const utils = require('../../../app/libs/utils');
const assert = require('assert');

const { makeMongoId } = utils;
const noteValidator = validators.note;

// const logger = require('../../../lib/logging/logger').create('test.model-note');

describe('/app/models/note', () => {
  test('should pass minimum validation', (done) => {
    const note = {
      _id: makeMongoId(),
      date: 20160101,
      plantIds: [makeMongoId()],
      note: 'some text',
      userId: makeMongoId(),
    };
    const noteCopy = _.clone(note);

    noteValidator(note, (err, transformed) => {
      assert(!err);
      assert.equal(transformed.note, note.note);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should fail validation', (done) => {
    // All items in note should be invalid
    const note = {
      _id: '0e55d91cb33d42', // Not a MongoId
      date: 'Not a Number',
      plantIds: ['9ec5c8ffcf885bf'], // Not a MongoId in array
      note: {}, // not a string
    };

    const noteCopy = _.clone(note);

    noteValidator(note, (err /* , transformed */) => {
      assert(err);

      assert.equal(err._id, ' id is invalid');
      assert.equal(err.date, 'Date must be a number');
      assert.equal(err.plantIds, 'Plant ids must be MongoIds');
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should strip out props not in the schema', (done) => {
    const note = {
      _id: makeMongoId(),
      date: 20160101,
      plantIds: [makeMongoId()],
      note: 'some text',
      fakeName1: 'Common Name',
      fakeName2: 'Description',
      plantId: 'fake plant id',
    };
    const noteCopy = _.clone(note);

    noteValidator(note, (err, transformed) => {
      assert(!err);
      assert.equal(Object.keys(transformed).length, 4);
      assert.equal(transformed._id, note._id);
      assert.equal(transformed.note, note.note);
      assert.equal(transformed.userId, note.userId);
      assert(!transformed.fakeName1);
      assert(!transformed.fakeName2);
      assert(!transformed.plantId);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should add _id if it is a new record', (done) => {
    const note = {
      date: 20160101,
      plantIds: [makeMongoId()],
      note: 'some text',
    };
    const noteCopy = _.cloneDeep(note);

    noteValidator(note, (err, transformed) => {
      assert(!err);
      assert.equal(Object.keys(transformed).length, 4);
      assert(transformed._id);
      assert(constants.mongoIdRE.test(transformed._id));
      assert.equal(transformed.note, note.note);
      assert.equal(transformed.userId, note.userId);
      assert.deepEqual(transformed.plantIds, note.plantIds);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should fail if plantIds is empty', (done) => {
    const note = {
      _id: makeMongoId(),
      date: 20160101,
      plantIds: [],
      note: 'some text',
    };
    const noteCopy = _.clone(note);

    noteValidator(note, (err, transformed) => {
      assert(err);
      assert.equal(err.plantIds, 'You must select at least 1 plant for this note.');
      assert.equal(Object.keys(transformed).length, 4);
      assert.equal(transformed._id, note._id);
      assert.equal(transformed.note, note.note);
      assert.equal(transformed.userId, note.userId);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should fail if plantIds is missing', (done) => {
    const note = {
      _id: makeMongoId(),
      date: 20160101,
      note: 'some text',
    };
    const noteCopy = _.clone(note);

    noteValidator(note, (err, transformed) => {
      assert(err);
      assert.equal(err.plantIds, 'Plant ids is required');
      assert.equal(Object.keys(transformed).length, 3);
      assert.equal(transformed._id, note._id);
      assert.equal(transformed.note, note.note);
      assert.equal(transformed.userId, note.userId);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  test('should fail if plantIds is not an array', (done) => {
    const note = {
      _id: makeMongoId(),
      date: 20160101,
      note: 'some text',
      plantIds: makeMongoId(),
    };
    const noteCopy = _.clone(note);

    noteValidator(note, (err, transformed) => {
      assert(err);
      assert.equal(err.plantIds, 'Plant ids must be an array');
      assert.equal(Object.keys(transformed).length, 4);
      assert.equal(transformed._id, note._id);
      assert.equal(transformed.note, note.note);
      assert.equal(transformed.userId, note.userId);
      assert.deepEqual(noteCopy, note);
      done();
    });
  });

  describe('note.model/images validation', () => {
    const image = {
      ext: 'jpg',
      id: makeMongoId(),
      originalname: 'apple tree',
      size: 123456,
    };

    test('should pass with an empty images array', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);


      noteValidator(note, (err, transformed) => {
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should pass with valid images', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should pass with valid images and an empty note', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        note: '',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should pass with valid images and a missing note', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [image],
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert.equal(Object.keys(transformed).length, 4);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images is not an array', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: makeMongoId(),
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must be an array');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images id is not a mongoId', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { id: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must be valid image objects');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images ext is not a string', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { id: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must be valid image objects');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images originalname is not a string', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { originalname: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must be valid image objects');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should convert image size if it is a string number', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { size: 123 })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(!err);
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.equal(transformed.images[0].size, 123);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images ext is longer than 20', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { ext: '123456789012345678901' })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must be valid image objects');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });

    test('should fail if images has extra props', (done) => {
      const note = {
        _id: makeMongoId(),
        date: 20160101,
        images: [Object.assign({}, image, { extra: 'jpg' })],
        note: 'some text',
        plantIds: [makeMongoId()],
      };
      const noteCopy = _.clone(note);

      noteValidator(note, (err, transformed) => {
        assert(err);
        assert.equal(err.images, 'Images must only have the following allowed props: id,ext,originalname,size,sizes and found these props as well: extra');
        assert.equal(Object.keys(transformed).length, 5);
        assert.equal(transformed._id, note._id);
        assert.equal(transformed.note, note.note);
        assert.equal(transformed.userId, note.userId);
        assert.deepEqual(noteCopy, note);
        done();
      });
    });
  });
});
