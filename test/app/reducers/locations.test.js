// const _ = require('lodash');
const locations = require('../../../app/reducers/locations');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

describe('/app/reducers/locations', () => {
  test('should load locations', () => {
    const state = seamless.from({
      1: {
        _id: '1',
        plantIds: ['one'],
      },
      2: {
        _id: '2',
        name: 'xxx',
        plantIds: ['xxx'],
      },
    });

    // TODO: Should the Locations collection be coming back from the server as an object
    // or an array? How is it maintained in the reducer? As an object or an array?

    const payload = {
      2: {
        _id: '2',
        name: 'twenty-two',
        plantIds: ['two', 'twenty'],
      },
      3: {
        _id: '33',
        name: 'thirty-three',
        plantIds: ['three', 'thirty'],
      },
    };

    const actual = locations(state, actions.loadLocationsSuccess(payload));
    expect(actual).toMatchSnapshot();
  });
});
