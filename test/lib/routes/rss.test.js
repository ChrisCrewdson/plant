const bson = require('bson');

const { ObjectID } = bson;

/** @type {BizPlant[]} */
const plants = [{
  _id: 'pid2',
  locationId: 'lid1',
  userId: 'uid1',
  title: 'Test Title',
}];

const _id = new ObjectID('012345678901234567890123');
const userId = new ObjectID('012345678901234567890123');

const mockMongo = () => ({
  getNotesLatest: async () => {
    /** @type {DbNoteWithPlants[]} */
    const dbNoteWithPlants = [{
      _id,
      date: 20170606,
      plants,
      plantIds: [],
      userId,
    }];
    return Promise.resolve(dbNoteWithPlants);
  },
});

jest.mock('../../../lib/db/mongo', () => mockMongo);

const rss = require('../../../lib/routes/rss.js');

describe('rss', () => {
  test('renders xml', (done) => {
    const req = {
      protocol: 'fake protocol',
      get: () => 'fake host',
    };
    const res = {
      status: () => res,
      /** @param {string} builtXml */
      send: (builtXml) => {
        expect(builtXml).toMatchSnapshot();
        done();
      },
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
