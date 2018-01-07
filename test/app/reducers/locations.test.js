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

    const payload = {
      2: {
        _id: '2',
        name: 'twenty-two',
        plantIds: ['two', 'twenty'],
      },
      3: {
        _id: '3',
        name: 'thirty-three',
        plantIds: ['three', 'thirty'],
      },
      4: {
        _id: '4',
        name: 'four',
      },
    };

    const actual = locations(state, actions.loadLocationsSuccess(payload));
    expect(actual).toMatchSnapshot();
  });

  test('should load locations with undefined payload', () => {
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

    const actual = locations(state, actions.loadLocationsSuccess(undefined));
    expect(actual).toMatchSnapshot();
  });
});
