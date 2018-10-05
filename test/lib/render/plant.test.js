const helper = require('../../helper');

describe('lib/render/plant', () => {
  let data;
  beforeAll(async () => {
    data = await helper.startServerAuthenticated();
    expect(data.userId).toBeTruthy();
  });
  afterAll(() => helper.stopServer());

  beforeAll(async () => {
    const { userId } = data;
    const [locationId] = data.user.locationIds;
    // 1. Create 2 plants
    const plants = await helper.createPlants(1, userId, locationId);
    expect(plants).toHaveLength(1);

    const [plant] = plants;
    // 2. Create 3 notes, part 1.1:
    //    Note #1: plantIds reference plant #1

    const response = await helper.createNote([plant._id], { note: 'Note #1' });
    const { note } = response;
    expect(response.success).toBe(true);
    expect(note).toBeTruthy();

    data.note = note;
    data.plant = plant;
  });

  test('should get a 200 on a happy-path server render', async () => {
    // /plant/thai-sapodilla/57dd70e583d8030000354fb0?noteid=5830b656b6a2c9000041f323
    const { note: { _id: noteId }, plant: { _id: plantId } } = data;
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      text: true,
      url: `/plant/slug/${plantId}?noteid=${noteId}`,
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(response.status).toBe(200);
    const docType = '<!DOCTYPE html>';
    expect(httpMsg).toContain(docType);
  });
});
