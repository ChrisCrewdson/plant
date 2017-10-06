const mongo = require('../db/mongo');
const logger = require('../logging/logger').create('api-plants');

module.exports = (app) => {
  /**
   * An anonymous request for all plants at a given location.
   */
  app.get('/api/plants/:locationId', (req, res) => {
    const { params = {} } = req || {};
    const { locationId } = params;

    if (!locationId) {
      return res.status(404).send({ error: 'No locationId in URL' });
    }

    const loggedInUserId = req.user && req.user._id;
    return mongo.getPlantsByLocationId(locationId, loggedInUserId)
      .then((result) => {
        if (!result) {
          return res.status(404).send();
        }
        return res.status(200).send(result);
      })
      .catch(err => res.status(500).send({ error: err.message }));
  });

  // Anonymous request with array of plantIds
  app.post('/api/unloaded-plants', (req, res) => {
    // logger.trace('/api/unloaded-plants body', {body: req.body});

    const { plantIds } = req.body;
    if (!plantIds || !plantIds.length) {
      logger.error('No ids in POST /api/unloaded-plants', { plantIds });
      return res.status(404).send('No plantIds in body request');
    }
    const loggedInUserId = req.user && req.user._id;
    return mongo.getPlantsByIds(plantIds, loggedInUserId)
      .then((plants) => {
        logger.trace('responding with plants:', { plants });
        return res.send(plants);
      }).catch(() => res.status(500).send('Error getting plants'));
  });
};
