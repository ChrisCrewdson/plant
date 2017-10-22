const helper = require('../../helper');
const utils = require('../../../app/libs/utils');
const assert = require('assert');
const constants = require('../../../app/libs/constants');
const mongo = require('../../../lib/db/mongo');

const logger = require('../../../lib/logging/logger').create('test.note-api');

describe('note-api', () => {
  let userId;
  let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    assert(data.userId);
    userId = data.user._id;
    locationId = data.user.locationIds[0]._id;
    logger.trace('startServerAuthenticated userId:', { userId });
  });

  let initialPlant;
  let plantId;

  const initialNote = {
    note: 'This is a note',
    date: 20160101,
  };
  let noteId;

  beforeAll(async () => {
    const howMany = 1;
    const plants = await helper.createPlants(howMany, userId, locationId);
    [initialPlant] = plants;
    plantId = initialPlant._id;
    initialNote.plantIds = [plantId];
    logger.trace('plant created:', { initialPlant });
  });

  describe('create failures', () => {
    test('should fail to create a note if user is not authenticated', async () => {
      const reqOptions = {
        method: 'POST',
        authenticate: false,
        body: initialNote,
        json: true,
        url: '/api/note',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 401);
      assert(response);
      assert.equal(response.error, 'Not Authenticated');
    });

    test('should fail server validation if plantIds are missing', async () => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: Object.assign({}, initialNote, { plantIds: [] }),
        json: true,
        url: '/api/note',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // response should look like:
      // { plantIds: [ 'Plant ids must be an array' ], note: [ 'Note can\'t be blank' ] }
      assert.equal(httpMsg.statusCode, 400);
      assert(response);
      assert.equal(response.plantIds, 'You must select at least 1 plant for this note.');
    });
  });

  describe('note-api create/retrieve notes', () => {
    test('should create a note', async () => {
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: initialNote,
        json: true,
        url: '/api/note',
      };
      // logger.trace('options for note create', {reqOptions});
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // logger.trace('result of create note', {response});
      const { note } = response;
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert(note.note);
      assert(constants.mongoIdRE.test(note._id));

      noteId = note._id;
      // logger.trace('note created', {note});
    });

    test('should retrieve the just created noteId plant', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plant/${plantId}`,
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // response should look like:
      // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
      // title: 'Plant Title',
      // userId: '241ff27e28c7448fb22c4f6fb2580923'}
      logger.trace('note retrieved:', { response });
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert(response.userId);
      assert.equal(response._id, plantId);
      assert.equal(response.title, initialPlant.title);
      assert(response.notes);
      assert.equal(response.notes.length, 1);
      assert(constants.mongoIdRE.test(response.notes[0]));
    });

    let updatedNote;
    test('should update the just created note', async () => {
      updatedNote = Object.assign(
        {},
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

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // response should look like:
      // { ok: 1, nModified: 1, n: 1 }
      // Mongo 2.x does not return nModified which is what Travis uses so do not check this
      // logger.trace('*********** response:', {updatedNote, reqOptions, response});
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert.equal(response.success, true);
    });

    test(
      'should retrieve the just updated noteId as part of a plant request',
      async () => {
        const reqOptions = {
          method: 'GET',
          authenticate: false,
          json: true,
          url: `/api/plant/${plantId}`,
        };

        const { httpMsg, response } = await helper.makeRequest(reqOptions);
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
      },
    );

    test(
      'should retrieve the noteId as part of a multiple note request',
      async () => {
        const reqOptions = {
          method: 'POST',
          authenticate: true,
          body: { noteIds: [noteId] },
          json: true,
          url: '/api/notes',
        };

        const { httpMsg, response: notes } = await helper.makeRequest(reqOptions);
        assert.equal(httpMsg.statusCode, 200);

        assert(notes);
        assert.equal(notes.length, 1);
        const note = notes[0];
        assert.equal(note._id, noteId);
        assert(constants.mongoIdRE.test(note._id));
        assert.equal(note.date, 20160101);
        assert.equal(note.note, 'A New Note');
      },
    );

    test(
      'should retrieve the noteId as part of a plantId note request',
      async () => {
        const reqOptions = {
          method: 'POST',
          authenticate: true,
          body: { plantId },
          json: true,
          url: '/api/notes',
        };

        const { httpMsg, response: notes } = await helper.makeRequest(reqOptions);
        assert.equal(httpMsg.statusCode, 200);

        assert(notes);
        assert.equal(notes.length, 1);
        const note = notes[0];
        assert.equal(note._id, noteId);
        assert(constants.mongoIdRE.test(note._id));
        assert.equal(note.date, 20160101);
        assert.equal(note.note, 'A New Note');
      },
    );

    test('should delete the note', async () => {
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/note/${noteId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // response should look like:
      // { lastErrorObject: { n: 1 },
      // value:
      // { _id: 'c3478867852c47529ddcc498',
      //   note: 'A New Note',
      //   date: '2016-08-12T23:49:12.244Z',
      //   plantIds: [ '78d0570bc9104b0ca4cc29c2' ],
      //   userId: 'f5d12193ae674e7ab6d1e106' },
      // ok: 1 }

      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert.equal(response.success, true);
    });

    test('should confirm that the note has been deleted', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plant/${plantId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);

      assert(response.userId);
      assert.equal(response._id, plantId);
      assert.equal(response.title, initialPlant.title);


      // Check that there are no notes
      assert.equal(response.notes.length, 0);
    });
  });

  describe('note-api /api/image-complete', () => {
    test('should confirm a complete image', async () => {
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

      async function createNote(data) {
        const createdNote = await mongo.upsertNote(note);
        assert(createdNote);
        // logger.trace('createdNote', {createdNote});
        // data.createdNote = body;
        return Object.assign({}, data, { createdNote });
      }

      async function makePutRequest(createdNote) {
        const putData = {
          metadata: {
            noteid: createdNote._id,
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

        const { httpMsg, response } = await helper.makeRequest(reqOptions);
        const { success } = response;
        assert.equal(httpMsg.statusCode, 200);
        assert.equal(success, true);
        return response;
      }

      async function getNote(createdNote) {
        const fetchedNote = await mongo.getNoteById(createdNote._id);
        assert.deepEqual(fetchedNote.images[0].sizes, sizes);
        assert(!fetchedNote.images[1].sizes);
        return fetchedNote;
      }

      const { createdNote } = await createNote();
      assert(createdNote);
      assert.strictEqual(createdNote._id.length, 24);
      assert.strictEqual(createdNote.images.length, 2);
      const putResponse = await makePutRequest(createdNote);
      assert(putResponse);
      assert.strictEqual(putResponse.success, true);
      const fetchedNote = await getNote(createdNote);
      assert(fetchedNote);
      assert.strictEqual(fetchedNote._id.length, 24);
      assert.strictEqual(fetchedNote.images.length, 2);
    });
  });
});
