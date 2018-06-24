const mongo = require('../db/mongo')();
const tokenCheck = require('../config/token-check');
const validators = require('../../app/models');
const utils = require('../../app/libs/utils');

const { plant: plantValidator } = validators;

const { requireToken } = tokenCheck;

const moduleName = 'routes/api-plant';

module.exports = (app) => {
  // Plant CRUD operations
  // Plant Create
  app.post('/api/plant', requireToken, async (req, res) => {
    const { logger } = req;
    logger.trace({ moduleName, msg: 'POST /api/plant:', 'req.body': req.body });

    try {
      const plant = utils.plantFromBody(req.body);
      plant.userId = req.user._id;
      const isNew = true;

      let transformed;
      try {
        transformed = plantValidator(plant, { isNew });
      } catch (validatePlantErr) {
        logger.error({
          moduleName,
          msg: '/api/plant validate error, returning 400',
          validatePlantErr,
          'req.body': req.body,
          'req.user': req.user,
        });
        return res.status(400).send(validatePlantErr);
      }

      const response = await mongo.createPlant(transformed, req.user._id, logger);
      return res.send(response);
    } catch (createPlantErr) {
      return res.status(500).send('server error');
    }
  });

  // Plant Read
  app.get('/api/plant/:plantId', async (req, res) => {
    const { logger } = req;
    const { plantId } = req.params;
    if (!plantId) {
      return res.status(404).send({ error: `Missing plantId in request url: ${req.path}` });
    }
    const loggedInUserId = req.user && req.user._id;
    try {
      const result = await mongo.getPlantById(plantId, loggedInUserId, logger);
      logger.trace({ moduleName, msg: `response /api/plant/${plantId}:`, result });
      if (result) {
        return res.status(200).send(result);
      }
      return res.status(404).send({ error: 'missing' });
    } catch (err) {
      return res.status(500).send({ error: 'server error' });
    }
  });

  // Plant Update
  app.put('/api/plant', requireToken, async (req, res) => {
    const { logger } = req;

    const plant = utils.plantFromBody(req.body);
    plant.userId = req.user._id;

    const isNew = false;

    let transformed;
    try {
      transformed = plantValidator(plant, { isNew });
    } catch (err) {
      logger.warn({ moduleName, msg: 'response PUT /api/plant: 400', err });
      return res.status(400).send(err);
    }

    try {
      const loggedInUserId = req.user && req.user._id;
      const response = await mongo.updatePlant(transformed, loggedInUserId);
      return res.send(response);
    } catch (err) {
      logger.error({
        moduleName,
        msg: 'PUT /api/plant/:plantId',
        req,
        err,
      });
      return res.status(500).send('server error');
    }
  });

  // Plant Delete
  app.delete('/api/plant/:plantId', requireToken, async (req, res) => {
    const { logger } = req;
    const { plantId } = req.params;

    if (!plantId) {
      return res.status(403).send({ error: 'Missing plantId' });
    }

    const userId = req.user._id;

    try {
      const deletedCount = await mongo.deletePlant(plantId, userId);
      if (deletedCount) {
        return res.status(200).send({ message: 'Deleted' });
      }
      return res.status(404).send({ message: 'Not Found' });
    } catch (plantDeleteErr) {
      logger.error({
        moduleName,
        msg: 'DELETE /api/plant/:plantId',
        plantId,
        req,
        err: plantDeleteErr,
      });
      return res.status(500).send({ Error: plantDeleteErr.message });
    }
  });
};
