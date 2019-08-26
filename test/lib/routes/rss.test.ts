const bson = require('bson');

const { ObjectID } = bson;

/** @type {BizPlant[]} */
const plants = [{
  _id: 'pid2',
  locationId: 'lid1',
  userId: 'uid1',
  title: 'Test Title',
}];

const testObjectId = new ObjectID('012345678901234567890123');
const _id = testObjectId;
const userId = testObjectId;
const plantIds = [testObjectId];
/** @type {DbNoteWithPlants[]} */
const dbNoteWithPlants = [{
  _id,
  date: 20170606,
  plants,
  plantIds,
  userId,
}];

const mockMongo = () => ({
  getNotesLatest: async () => Promise.resolve(dbNoteWithPlants),
});

jest.mock('../../../lib/db/mongo', () => mockMongo);

const rss = require('../../../lib/routes/rss.js');

const req = {
  protocol: 'fake protocol',
  get: () => 'fake host',
};

const res = {
  status: () => res,
  /** @param {string} builtXml */
  send: (_: string) => {}, // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
};

describe('rss', () => {
  test('renders xml', (done) => {
    /** @param {string} builtXml */
    res.send = (builtXml) => {
      expect(builtXml).toMatchSnapshot();
      done();
    };
    /** @type {import("express").Application} */
    const app = {
      // @ts-ignore - ignore for testing
      get: (_, routeAction) => {
        routeAction(req, res);
      },
    };
    rss(app);
  });

  // Use different input values to force target code down
  // different paths and increase coverage.
  test('renders xml on alternate paths', (done) => {
    plants[0].title = '';
    plants[1] = plants[0]; // eslint-disable-line prefer-destructuring
    // @ts-ignore - can be removed once this is correctly typed
    dbNoteWithPlants[0].images = [{
      id: '',
      ext: '.png',
      originalname: 'orig-file-name',
      size: 1234,
      sizes: [{
        name: 'orig',
        width: 1000,
      }],
    }];
    // @ts-ignore - can be removed once this is correctly typed
    dbNoteWithPlants[0].note = 'Some text';
    /** @param {string} builtXml */
    res.send = (builtXml) => {
      expect(builtXml).toMatchSnapshot();
      done();
    };
    /** @type {import("express").Application} */
    const app = {
      // @ts-ignore - ignore for testing
      get: (_, routeAction) => {
        routeAction(req, res);
      },
    };
    rss(app);
  });
});
