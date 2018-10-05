const helper = require('../../helper');

describe('api', () => {
  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    const { userId, port } = data;
    expect(userId).toBeTruthy();
    expect(port).toBeGreaterThan(3000);
  });

  afterAll(() => helper.stopServer());

  test('should get a 404 if the path is not recognized', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      text: true,
      url: '/unknown',
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(response.status).toBe(404);
    expect(httpMsg).toMatchSnapshot();
  });
});
