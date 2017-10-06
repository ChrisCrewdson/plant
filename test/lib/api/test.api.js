const _ = require('lodash');
const helper = require('../../helper');
const assert = require('assert');

const logger = require('../../../lib/logging/logger').create('test.plants-api');

describe('api', () => {
  before('it should start the server and setup auth token',
    () => helper.startServerAuthenticated().then((data) => {
      assert(data.userId);
    }).catch(error => assert(!error)));

  it('should get a 404 if the path is not recognized', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: '/unknown',
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    assert.equal(httpMsg.statusCode, 404);
    const docType = '<!DOCTYPE html>';
    logger.trace('response:', { response });
    assert(_.includes(response, docType), `Expected ${response} to have ${docType}`);
  });
});
