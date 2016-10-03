import * as helper from '../../helper';
import * as utils from '../../../app/libs/utils';
import assert from 'assert';
import async from 'async';
import constants from '../../../app/libs/constants';
import mongo from '../../../lib/db/mongo';

const logger = require('../../../lib/logging/logger').create('test.note-api');

describe('note-api', function() {
  this.timeout(10000);
  let userId;

  before('it should start the server and setup auth token', done => {
    helper.startServerAuthenticated((err, data) => {
      assert(data.userId);
      userId = data.userId;
      logger.trace('startServerAuthenticated userId:', {userId});
      done();
    });
  });

  let initialPlant;
  let plantId;

  const initialNote = {
    note: 'This is a note',
    date: 20160101
  };
  let noteId;

  before('it should create a plant', (done) => {
    const howMany = 1;
    helper.createPlants(howMany, userId, (err, plants) => {
      initialPlant = plants[0];
      plantId = initialPlant._id;
      initialNote.plantIds = [plantId];
      logger.trace('plant created:', {initialPlant});
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
        url: '/api/note'
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
        body: {...initialNote, plantIds: []},
        json: true,
        url: '/api/note'
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { plantIds: [ 'Plant ids must be an array' ], note: [ 'Note can\'t be blank' ] }
        assert(!error);
        assert.equal(httpMsg.statusCode, 400);
        assert(response);
        assert.equal(response.plantIds[0], 'Plant ids must have at least 1 on plant associated');

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
        url: '/api/note'
      };
      // logger.trace('options for note create', {reqOptions});
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // logger.trace('result of create note', {response});
        const {note} = response;
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
        url: `/api/plant/${plantId}`
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
        // title: 'Plant Title',
        // userId: '241ff27e28c7448fb22c4f6fb2580923'}
        logger.trace('note retrieved:', {response});
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
      updatedNote = {
        ...initialNote,
        note: 'A New Note',
        _id: noteId
      };

      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: updatedNote,
        json: true,
        url: '/api/note'
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // response should look like:
        // { ok: 1, nModified: 1, n: 1 }
        // Mongo 2.x does not return nModified which is what Travis uses so do not check this
        logger.trace('*********** response:', {updatedNote, reqOptions, response});
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
        url: `/api/plant/${plantId}`
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

    it('should delete the note', (done) => {

      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/note/${noteId}`
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
        url: `/api/plant/${plantId}`
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
          size: 999
        }, {
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'leaf',
          size: 666
        }]
      };
      const sizes = [
        {width:100, name:'thumb'},
        {width:500, name:'sm'},
        {width:1000, name:'md'},
        {width:1500, name:'lg'},
        {width:2000, name:'xl'}
      ];

      function createNote(data, cb) {
        mongo.upsertNote(note, (err, body) => {
          assert(!err);
          assert(body);
          // logger.trace('body', {body});
          data.createdNote = body;
          cb(err, data);
        });
      }

      function makePutRequest(data, cb) {
        const putData = {
          metadata: {
            noteid: data.createdNote._id,
            id: note.images[0].id,
            userid: note.userId
          },
          sizes
        };

        const reqOptions = {
          method: 'PUT',
          authenticate: false,
          body: putData,
          json: true,
          url: '/api/image-complete?token=fake-image-token'
        };

        helper.makeRequest(reqOptions, (error, httpMsg, response) => {
          console.log('response:', response);
          const {success} = response;
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
        getNote
      ], (err, data) => {
        assert(!err);
        assert(data);
        done();
      });


    });
  });

});
