const mongo = require('../db/mongo');
const tokenCheck = require('../config/token-check');
const validators = require('../../app/models');
const utils = require('../../app/libs/utils');

const {
  plant: validatePlant,
} = validators;

const { requireToken } = tokenCheck;

const logger = require('../logging/logger').create('api-plant');

module.exports = (app) => {
  // Plant CRUD operations
  // Plant Create
  app.post('/api/plant', requireToken, (req, res) => {
    logger.trace('POST /api/plant:', { 'req.body': req.body });

    const plant = utils.plantFromBody(req.body);
    plant.userId = req.user._id;
    const isNew = true;

    validatePlant(plant, { isNew }, (validatePlantErr, transformed) => {
      if (validatePlantErr) {
        logger.error('/api/plant validate error, returning 400', { validatePlantErr, 'req.body': req.body, 'req.user': req.user });
        return res.status(400).send(validatePlantErr);
      }

      return mongo.createPlant(transformed, req.user._id)
        .then(response => res.send(response))
        .catch(createPlantErr => res.status(500).send(createPlantErr));
    });
  });

  // Plant Read
  app.get('/api/plant/:plantId', (req, res) => {
    const { plantId } = req.params;
    if (!plantId) {
      return res.status(404).send({ error: `Missing plantId in request url: ${req.path}` });
    }
    const loggedInUserId = req.user && req.user._id;
    return mongo.getPlantById(plantId, loggedInUserId)
      .then((result) => {
        logger.trace(`response /api/plant/${plantId}:`, result);
        if (result) {
          return res.status(200).send(result);
        }
        return res.status(404).send({ error: 'missing' });
      }).catch(err => res.status(500).send({ error: err.message }));
  });

  // Plant Update
  app.put('/api/plant', requireToken, (req, res) => {
    // logger.trace('PUT /api/plant req.user:', req.user && req.user.name);

    const plant = utils.plantFromBody(req.body);
    plant.userId = req.user._id;

    const isNew = false;

    validatePlant(plant, { isNew }, (err, transformed) => {
      if (err) {
        logger.trace('response PUT /api/plant: 400', err);
        return res.status(400).send(err);
      }

      const loggedInUserId = req.user && req.user._id;
      return mongo.updatePlant(transformed, loggedInUserId)
        .then(response => res.send(response))
        .catch(updatePlantErr => res.status(500).send(updatePlantErr));
    });
  });

  // Plant Delete
  app.delete('/api/plant/:plantId', requireToken, (req, res) => {
    const { plantId } = req.params;

    if (!plantId) {
      return res.status(403).send({ error: 'Missing plantId' });
    }

    const userId = req.user._id;

    return mongo.deletePlant(plantId, userId)
      .then((deletedCount) => {
        if (deletedCount) {
          return res.status(200).send({ message: 'Deleted' });
        }
        return res.status(404).send({ message: 'Not Found' });
      }).catch(plantDeleteErr => res.status(500).send({ Error: plantDeleteErr.message }));
  });
};
