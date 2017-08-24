const helper = require('../../helper');
const utils = require('../../../app/libs/utils');
const assert = require('assert');
const async = require('async');
const constants = require('../../../app/libs/constants');
const mongo = require('../../../lib/db/mongo');

const logger = require('../../../lib/logging/logger').create('test.note-api');

describe('note-api', () => {
  let userId;
  let locationId;

  before('it should start the server and setup auth token', (done) => {
    helper.startServerAuthenticated((err, data) => {
      assert(!err);
      assert(data.userId);
      userId = data.user._id;
      locationId = data.user.locationIds[0]._id;
      logger.trace('startServerAuthenticated userId:', { userId });
      done();
    });
  });

  let initialPlant;
  let plantId;

  const initialNote = {
    note: 'This is a note',
    date: 20160101,
  };
  let noteId;

  before('it should create a plant', (done) => {
    const howMany = 1;
    helper.createPlants(howMany, userId, locationId, (err, plants) => {
      initialPlant = plants[0];
      plantId = initialPlant._id;
      initialNote.plantIds = [plantId];
      logger.trace('plant created:', { initialPlant });
      done();
    });
  });

  describe('create failures', () => {
    it('should fail to create a note if user is not authenticated', (done) => {
      const reqOptions = {
        method: 'POST',
        authenticate: false,
        body: initialNote,
        json: true,
        url: '/api/note',
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        assert(!error);
        assert.equal(httpMsg.statusCode, 401);
        assert(response);
        assert.equal(response.error, 'Not Authenticated');

        done();
      });
    });

    it('should fail server validation if plantIds are missing', (done) => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: Object.assign({}, initialNote, { plantIds: [] }),
        json: true,
        url: '/api/note',
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { plantIds: [ 'Plant ids must be an array' ], note: [ 'Note can\'t be blank' ] }
        assert(!error);
        assert.equal(httpMsg.statusCode, 400);
        assert(response);
        assert.equal(response.plantIds, 'You must select at least 1 plant for this note.');

        done();
      });
    });
  });

  describe('note-api create/retrieve notes', () => {
    it('should create a note', (done) => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: initialNote,
        json: true,
        url: '/api/note',
      };
      // logger.trace('options for note create', {reqOptions});
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // logger.trace('result of create note', {response});
        const { note } = response;
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);
        assert(note.note);
        assert(constants.mongoIdRE.test(note._id));

        noteId = note._id;
        // logger.trace('note created', {note});

        done();
      });
    });

    it('should retrieve the just created noteId plant', (done) => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plant/${plantId}`,
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
        // title: 'Plant Title',
        // userId: '241ff27e28c7448fb22c4f6fb2580923'}
        logger.trace('note retrieved:', { response });
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);
        assert(response.userId);
        assert.equal(response._id, plantId);
        assert.equal(response.title, initialPlant.title);
        assert(response.notes);
        assert.equal(response.notes.length, 1);
        assert(constants.mongoIdRE.test(response.notes[0]));

        done();
      });
    });

    let updatedNote;
    it('should update the just created note', (done) => {
      updatedNote = Object.assign({},
        initialNote, {
          note: 'A New Note',
          _id: noteId,
        },
      );

      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: updatedNote,
        json: true,
        url: '/api/note',
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { ok: 1, nModified: 1, n: 1 }
        // Mongo 2.x does not return nModified which is what Travis uses so do not check this
        // logger.trace('*********** response:', {updatedNote, reqOptions, response});
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);
        assert.equal(response.success, true);

        done();
      });
    });

    it('should retrieve the just updated noteId as part of a plant request', (done) => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plant/${plantId}`,
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);

        assert(response.userId);
        assert.equal(response._id, plantId);
        assert.equal(response.title, initialPlant.title);


        // Check notes
        assert(response.notes);
        assert.equal(response.notes.length, 1);
        assert.equal(response.notes[0], noteId);
        assert(constants.mongoIdRE.test(response.notes[0]));

        done();
      });
    });

    it('should retrieve the noteId as part of a multiple note request', (done) => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: { noteIds: [noteId] },
        json: true,
        url: '/api/notes',
      };

      helper.makeRequest(reqOptions, (error, httpMsg, notes) => {
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);

        assert(notes);
        assert.equal(notes.length, 1);
        const note = notes[0];
        assert.equal(note._id, noteId);
        assert(constants.mongoIdRE.test(note._id));
        assert.equal(note.date, 20160101);
        assert.equal(note.note, 'A New Note');

        done();
      });
    });

    it('should retrieve the noteId as part of a plantId note request', (done) => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: { plantId },
        json: true,
        url: '/api/notes',
      };

      helper.makeRequest(reqOptions, (error, httpMsg, notes) => {
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);

        assert(notes);
        assert.equal(notes.length, 1);
        const note = notes[0];
        assert.equal(note._id, noteId);
        assert(constants.mongoIdRE.test(note._id));
        assert.equal(note.date, 20160101);
        assert.equal(note.note, 'A New Note');

        done();
      });
    });

    it('should delete the note', (done) => {
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/note/${noteId}`,
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { lastErrorObject: { n: 1 },
        // value:
        // { _id: 'c3478867852c47529ddcc498',
        //   note: 'A New Note',
        //   date: '2016-08-12T23:49:12.244Z',
        //   plantIds: [ '78d0570bc9104b0ca4cc29c2' ],
        //   userId: 'f5d12193ae674e7ab6d1e106' },
        // ok: 1 }

        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);
        assert.equal(response.success, true);

        done();
      });
    });

    it('should confirm that the note has been deleted', (done) => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plant/${plantId}`,
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        assert(!error);
        assert.equal(httpMsg.statusCode, 200);
        assert(response);

        assert(response.userId);
        assert.equal(response._id, plantId);
        assert.equal(response.title, initialPlant.title);


        // Check that there are no notes
        assert.equal(response.notes.length, 0);

        done();
      });
    });
  });

  describe('note-api /api/image-complete', () => {
    it('should confirm a complete image', (done) => {
      const note = {
        userId: utils.makeMongoId(),
        images: [{
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'flower',
          size: 999,
        }, {
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'leaf',
          size: 666,
        }],
      };
      const sizes = [
        { width: 100, name: 'thumb' },
        { width: 500, name: 'sm' },
        { width: 1000, name: 'md' },
        { width: 1500, name: 'lg' },
        { width: 2000, name: 'xl' },
      ];

      function createNote(data, cb) {
        mongo.upsertNote(note, (err, createdNote) => {
          assert(!err);
          assert(createdNote);
          // logger.trace('createdNote', {createdNote});
          // data.createdNote = body;
          cb(err, Object.assign({}, data, { createdNote }));
        });
      }

      function makePutRequest(data, cb) {
        const putData = {
          metadata: {
            noteid: data.createdNote._id,
            id: note.images[0].id,
            userid: note.userId,
          },
          sizes,
        };

        const reqOptions = {
          method: 'PUT',
          authenticate: false,
          body: putData,
          json: true,
          url: '/api/image-complete?token=fake-image-token',
        };

        helper.makeRequest(reqOptions, (error, httpMsg, response) => {
          const { success } = response;
          assert(!error);
          assert.equal(httpMsg.statusCode, 200);
          assert.equal(success, true);

          cb(null, data);
        });
      }

      function getNote(data, cb) {
        mongo.getNoteById(data.createdNote._id, (err, fetchedNote) => {
          assert(!err);
          assert.deepEqual(fetchedNote.images[0].sizes, sizes);
          assert(!fetchedNote.images[1].sizes);
          cb(err, data);
        });
      }

      async.waterfall([
        createNote.bind(null, {}),
        makePutRequest,
        getNote,
      ], (err, data) => {
        assert(!err);
        assert(data);
        done();
      });
    });
  });
});
