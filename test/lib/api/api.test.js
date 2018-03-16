const helper = require('../../helper');

const logger = require('../../../lib/logging/logger').create('test.plants-api');

describe('api', () => {
  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    const { userId, port } = data;
    expect(userId).toBeTruthy();
    expect(port).toBeGreaterThan(3000);
  });

  test('should get a 404 if the path is not recognized', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: '/unknown',
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(httpMsg.statusCode).toBe(404);
    const docType = '<!DOCTYPE html>';
    logger.trace('response:', { response });
    expect(response).toContain(docType);
  });
});
