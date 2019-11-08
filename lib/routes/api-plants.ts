import { Application } from 'express';
import { getDbInstance } from '../db/mongo';

const mongo = getDbInstance();

const moduleName = 'routes/api-plants';

/**
 * api note routes
 */
export const plantsApi = (app: Application) => {
  /**
   * An anonymous request for all plants at a given location.
   */
  app.get('/api/plants/:locationId', async (req, res) => {
    const { params = {}, logger } = req;
    const { locationId } = params;

    if (!locationId) {
      return res.status(404).send({ error: 'No locationId in URL' });
    }

    const loggedInUserId = req.user && req.user._id;
    try {
      const result = await mongo.getPlantsByLocationId(locationId, loggedInUserId, logger);
      if (!result) {
        return res.status(404).send();
      }
      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).send({ error: 'server error' });
    }
  });

  // Anonymous request with array of plantIds
  app.post('/api/unloaded-plants', async (req, res) => {
    const { logger } = req;

    const { plantIds } = req.body;
    if (!plantIds || !plantIds.length) {
      logger.error({ moduleName, msg: 'No ids in POST /api/unloaded-plants', plantIds });
      return res.status(404).send('No plantIds in body request');
    }

    const loggedInUserId = req.user?._id;

    try {
      const plants = await mongo.getPlantsByIds(plantIds, loggedInUserId, logger);
      // logger.trace('responding with plants:', { plants });
      return res.send(plants);
    } catch (e) {
      return res.status(500).send('Error getting plants');
    }
  });
};
