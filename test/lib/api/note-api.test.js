
const helper = require('../../helper');
const utils = require('../../../app/libs/utils');
const constants = require('../../../app/libs/constants');
const mongo = require('../../../lib/db/mongo')();
const { mockLogger } = require('../../mock-logger');

const { mongoIdRE: mongoIdRegEx } = constants;

/* eslint-disable no-param-reassign */

describe('note-api', () => {
  /** @type {string} */
  let userId;
  /** @type {string} */
  let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    expect(data.userId).toBeTruthy();
    userId = data.user._id;
    [locationId] = data.user.locationIds;
  });
  afterAll(() => helper.stopServer());

  /** @type {BizPlant} */
  let initialPlant;
  /** @type {string} */
  let plantId;

  const initialNote = {
    note: 'This is a note',
    date: 20160101,
    /** @type {string[]} */
    plantIds: [],
  };
  /** @type {string} */
  let noteId;

  beforeAll(async () => {
    const howMany = 1;
    const plants = await helper.createPlants(howMany, userId, locationId);
    [initialPlant] = plants;
    plantId = initialPlant._id;
    initialNote.plantIds = [plantId];
  });

  describe('create failures', () => {
    test('should fail to create a note if user is not authenticated', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'POST',
        authenticate: false,
        body: initialNote,
        url: '/api/note',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(401);
      expect(httpMsg).toBeTruthy();
      expect(httpMsg.error).toBe('Not Authenticated');
    });

    test('should fail server validation if plantIds are missing', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: Object.assign({}, initialNote, { plantIds: [] }),
        url: '/api/note',
        text: true,
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // response should look like:
      // { plantIds: [ 'Plant ids must be an array' ], note: [ 'Note can\'t be blank' ] }
      expect(response.status).toBe(400);
      expect(httpMsg).toBeTruthy();
      expect(httpMsg).toBe('Error validating note during upsert. Check logs.');
    });
  });

  describe('note-api create/retrieve notes', () => {
    test('should create a note', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: initialNote,
        url: '/api/note',
      };
      // logger.trace('options for note create', {reqOptions});
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // logger.trace('result of create note', {response});
      const { note } = httpMsg;
      expect(response.status).toBe(200);
      expect(httpMsg).toBeTruthy();
      expect(note.note).toBeTruthy();
      expect(constants.mongoIdRE.test(note._id)).toBeTruthy();

      noteId = note._id;
      // logger.trace('note created', {note});
    });

    test('should retrieve the just created noteId plant', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        url: `/api/plant/${plantId}`,
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // httpMsg should look like:
      // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
      // title: 'Plant Title',
      // userId: '241ff27e28c7448fb22c4f6fb2580923'}
      expect(response.status).toBe(200);
      expect(httpMsg).toBeTruthy();
      expect(httpMsg.userId).toBeTruthy();
      expect(httpMsg._id).toBe(plantId);
      expect(httpMsg.title).toBe(initialPlant.title);
      expect(httpMsg.notes).toBeTruthy();
      expect(httpMsg.notes).toHaveLength(1);
      expect(constants.mongoIdRE.test(httpMsg.notes[0])).toBeTruthy();
    });

    let updatedNote;
    test('should update the just created note', async () => {
      updatedNote = Object.assign(
        {},
        initialNote, {
          note: 'A New Note',
          _id: noteId,
          metrics: {
            height: '5 5', // 5' 5"
            girth: '5',
            harvestCount: '1',
            harvestWeight: '3.6',
            firstBlossom: 'true',
            lastBlossom: 'true',
            firstBud: 'true',
            harvestStart: 'true',
            harvestEnd: 'true',
            leafShedStart: 'true',
            leafShedEnd: 'true',
          },
        },
      );

      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'POST',
        authenticate: true,
        body: updatedNote,
        url: '/api/note',
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // httpMsg should look like:
      // { ok: 1, nModified: 1, n: 1 }
      // Mongo 2.x does not return nModified which is what Travis uses so do not check this
      // logger.trace('*********** httpMsg:', {updatedNote, reqOptions, httpMsg});
      expect(response.status).toBe(200);

      expect(httpMsg).toMatchSnapshot({
        note: {
          _id: expect.stringMatching(mongoIdRegEx),
          userId: expect.stringMatching(mongoIdRegEx),
          plantIds: [expect.stringMatching(mongoIdRegEx)],
        },
      });
    });

    test(
      'should retrieve the just updated noteId as part of a plant request',
      async () => {
        /** @type {HelperMakeRequestOptions} */
        const reqOptions = {
          method: 'GET',
          authenticate: false,
          url: `/api/plant/${plantId}`,
        };

        const { httpMsg, response } = await helper.makeRequest(reqOptions);
        expect(response.status).toBe(200);

        expect(httpMsg._id).toBe(plantId);
        expect(httpMsg.notes[0]).toBe(noteId);

        expect(httpMsg).toMatchSnapshot({
          _id: expect.stringMatching(mongoIdRegEx),
          userId: expect.stringMatching(mongoIdRegEx),
          locationId: expect.stringMatching(mongoIdRegEx),
          notes: [expect.stringMatching(mongoIdRegEx)],
        });
      },
    );

    test(
      'should retrieve the noteId as part of a multiple note request',
      async () => {
        /** @type {HelperMakeRequestOptions} */
        const reqOptions = {
          method: 'POST',
          authenticate: true,
          body: { noteIds: [noteId] },
          url: '/api/notes',
        };

        const { httpMsg: notes, response } = await helper.makeRequest(reqOptions);
        expect(response.status).toBe(200);

        expect(notes).toBeTruthy();
        expect(notes).toHaveLength(1);
        const note = notes[0];
        expect(note._id).toBe(noteId);
        expect(constants.mongoIdRE.test(note._id)).toBeTruthy();
        expect(note.date).toBe(20160101);
        expect(note.note).toBe('A New Note');
      },
    );

    test(
      'should retrieve the noteId as part of a plantId note request',
      async () => {
        /** @type {HelperMakeRequestOptions} */
        const reqOptions = {
          method: 'POST',
          authenticate: true,
          body: { plantIds: [plantId] },
          url: '/api/notes',
        };

        const { httpMsg: notes, response } = await helper.makeRequest(reqOptions);
        expect(response.status).toBe(200);

        expect(notes).toBeTruthy();
        expect(notes).toHaveLength(1);
        const note = notes[0];
        expect(note._id).toBe(noteId);
        expect(constants.mongoIdRE.test(note._id)).toBeTruthy();
        expect(note.date).toBe(20160101);
        expect(note.note).toBe('A New Note');
      },
    );

    test('should delete the note', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        url: `/api/note/${noteId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      // httpMsg should look like:
      // { lastErrorObject: { n: 1 },
      // value:
      // { _id: 'c3478867852c47529ddcc498',
      //   note: 'A New Note',
      //   date: '2016-08-12T23:49:12.244Z',
      //   plantIds: [ '78d0570bc9104b0ca4cc29c2' ],
      //   userId: 'f5d12193ae674e7ab6d1e106' },
      // ok: 1 }

      expect(response.status).toBe(200);
      expect(httpMsg).toBeTruthy();
      expect(httpMsg.success).toBe(true);
    });

    test('should confirm that the note has been deleted', async () => {
      /** @type {HelperMakeRequestOptions} */
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        url: `/api/plant/${plantId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(200);
      expect(httpMsg).toBeTruthy();

      expect(httpMsg.userId).toBeTruthy();
      expect(httpMsg._id).toBe(plantId);
      expect(httpMsg.title).toBe(initialPlant.title);


      // Check that there are no notes
      expect(httpMsg.notes).toHaveLength(0);
    });
  });

  describe('note-api /api/image-complete', () => {
    test('should confirm a complete image', async () => {
      /** @type {BizNote} */
      const note = {
        _id: utils.makeMongoIdObject().toString(),
        date: 20180101,
        plantIds: [],
        userId: utils.makeMongoIdObject().toString(),
        images: [{
          ext: 'jpg',
          id: utils.makeMongoId(),
          originalname: 'flower',
          size: 999,
          sizes: [],
        }, {
          ext: 'jpg',
          id: utils.makeMongoId(),
          originalname: 'leaf',
          size: 666,
          sizes: [],
        }],
      };
      const sizes = [
        { width: 100, name: 'thumb' },
        { width: 500, name: 'sm' },
        { width: 1000, name: 'md' },
        { width: 1500, name: 'lg' },
        { width: 2000, name: 'xl' },
      ];

      async function createNote() {
        const createdNote = await mongo.upsertNote(note, mockLogger);
        expect(createdNote).toBeTruthy();
        // logger.trace('createdNote', {createdNote});
        // data.createdNote = body;
        return Object.assign({}, { createdNote });
      }

      /**
       * @param {BizNote} createdNote
       * @returns
       */
      async function makePutRequest(createdNote) {
        const putData = {
          metadata: {
            noteid: createdNote._id,
            id: note.images && note.images[0].id,
            userid: note.userId,
          },
          sizes,
        };

        /** @type {HelperMakeRequestOptions} */
        const reqOptions = {
          method: 'PUT',
          authenticate: false,
          body: putData,
          url: '/api/image-complete?token=fake-image-token',
        };

        const { httpMsg, response } = await helper.makeRequest(reqOptions);
        const { success } = httpMsg;
        expect(response.status).toBe(200);
        expect(success).toBe(true);
        return httpMsg;
      }

      const { createdNote } = await createNote();
      expect(createdNote).toBeTruthy();
      expect(createdNote._id).toHaveLength(24);
      expect(createdNote.images).toHaveLength(2);

      const putResponse = await makePutRequest(createdNote);
      expect(putResponse).toBeTruthy();
      expect(putResponse.success).toBe(true);

      const fetchedNote = await mongo.getNoteById(createdNote._id, mockLogger);
      // This makes tsc happy.
      if (!fetchedNote || !fetchedNote.images) {
        throw new Error(`fetchedNote or fetchedNote.images is falsy ${fetchedNote}`);
      }
      expect(fetchedNote.images[0].sizes).toEqual(sizes);
      expect(fetchedNote.images[1].sizes).toBeTruthy();
      expect(fetchedNote.images[0].sizes).toHaveLength(sizes.length);
      expect(fetchedNote.images[1].sizes).toHaveLength(0);
      expect(fetchedNote).toBeTruthy();
      expect(fetchedNote._id).toHaveLength(24);
      expect(fetchedNote.images).toHaveLength(2);
    });
  });
});

/* eslint-enable no-param-reassign */
