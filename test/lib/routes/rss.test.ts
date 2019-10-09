import { Application } from 'express';

const bson = require('bson');

const { ObjectID } = bson;

const plants: BizPlant[] = [{
  _id: 'pid2',
  locationId: 'lid1',
  userId: 'uid1',
  title: 'Test Title',
}];

const testObjectId = new ObjectID('012345678901234567890123');
const _id = testObjectId;
const userId = testObjectId;
const plantIds = [testObjectId];
const dbNoteWithPlants: DbNoteWithPlants[] = [{
  _id,
  date: 20170606,
  plants,
  plantIds,
  userId,
}];

jest.mock('../../../lib/db/mongo', () => ({
  getDbInstance: () => ({
    getNotesLatest: async () => Promise.resolve(dbNoteWithPlants),
  }),
}));

const rss = require('../../../lib/routes/rss');

const req = {
  protocol: 'fake protocol',
  get: () => 'fake host',
};

const res = {
  status: () => res,
  send: (_: string) => {}, // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
};

describe('rss', () => {
  test('renders xml', (done) => {
    res.send = (builtXml: string) => {
      expect(builtXml).toMatchSnapshot();
      done();
    };
    const app: Application = {
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

    dbNoteWithPlants[0].note = 'Some text';

    res.send = (builtXml: string) => {
      expect(builtXml).toMatchSnapshot();
      done();
    };

    const app: Application = {
      // @ts-ignore - ignore for testing
      get: (_, routeAction) => {
        routeAction(req, res);
      },
    };
    rss(app);
  });
});
