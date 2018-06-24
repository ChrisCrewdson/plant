const helper = require('../../helper');

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
    expect(response).toContain(docType);
  });
});
