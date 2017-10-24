const _ = require('lodash');
const helper = require('../../helper');
const assert = require('assert');

const logger = require('../../../lib/logging/logger').create('test.server-render-plant');

describe('lib/render/plant', () => {
  let data;
  beforeAll(async () => {
    data = await helper.startServerAuthenticated();
    assert(data.userId);
  });

  beforeAll(async () => {
    const { userId } = data;
    const locationId = data.user.locationIds[0]._id;
    // 1. Create 2 plants
    const plants = await helper.createPlants(1, userId, locationId);
    assert.equal(plants.length, 1);

    const [plant] = plants;
    // 2. Create 3 notes, part 1.1:
    //    Note #1: plantIds reference plant #1

    const response = await helper.createNote([plant._id], { note: 'Note #1' });
    const { note } = response;
    assert.equal(response.success, true);
    assert(note);

    data.note = note;
    data.plant = plant;
  });

  test('should get a 200 on a happy-path server render', async () => {
    // /plant/thai-sapodilla/57dd70e583d8030000354fb0?noteid=5830b656b6a2c9000041f323
    const { note: { _id: noteId }, plant: { _id: plantId } } = data;
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/plant/slug/${plantId}?noteid=${noteId}`,
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    assert.equal(httpMsg.statusCode, 200);
    const docType = '<!DOCTYPE html>';
    logger.trace('response:', { response });
    assert(_.includes(response, docType), `Expected ${response} to have ${docType}`);
  });
});
