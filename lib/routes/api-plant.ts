import { Application } from 'express';
import { getDbInstance } from '../db/mongo';
import { requireToken } from '../auth/token-check';

import * as validators from '../../app/models';
import utils from '../../app/libs/utils';

const mongo = getDbInstance();
const { plant: plantValidator } = validators;

const moduleName = 'routes/api-plant';

/**
 * api plant routes
 */
export const plantApi = (app: Application) => {
  // Plant CRUD operations
  // Plant Create
  app.post('/api/plant', requireToken, async (req, res) => {
    const { logger, user, body } = req;
    logger.trace({ moduleName, msg: 'POST /api/plant:', 'req.body': req.body });

    try {
      const userId = user?._id; // eslint-disable-line no-undef
      if (!userId) {
        // shouldn't happen because requireToken() makes sure user is logged in
        // this makes tsc happy
        throw new Error('userId is falsy in /api/plant');
      }
      const plant = utils.plantFromBody(req.body);
      plant.userId = userId;
      const isNew = true;

      let transformed;
      try {
        transformed = plantValidator(plant, { isNew });
      } catch (validatePlantErr) {
        logger.error({
          moduleName,
          msg: '/api/plant validate error, returning 400',
          validatePlantErr,
          'req.body': body,
          'req.user': user,
        });
        return res.status(400).send(validatePlantErr);
      }

      const response = await mongo.createPlant(transformed, userId, logger);
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
    const { logger, user } = req;

    const userId = user && user._id;
    if (!userId) {
      // shouldn't happen because requireToken() makes sure user is logged in
      // this makes tsc happy
      throw new Error('userId is falsy in /api/plant');
    }

    const plant = utils.plantFromBody(req.body);
    plant.userId = userId;

    const isNew = false;

    let transformed;
    try {
      transformed = plantValidator(plant, { isNew });
    } catch (err) {
      logger.warn({ moduleName, msg: 'response PUT /api/plant: 400', err });
      return res.status(400).send(err);
    }

    try {
      const response = await mongo.updatePlant(transformed, userId, logger);
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
    const { logger, user } = req;
    const { plantId } = req.params;

    const userId = user && user._id;
    if (!userId) {
      // shouldn't happen because requireToken() makes sure user is logged in
      // this makes tsc happy
      throw new Error('userId is falsy in /api/plant');
    }

    if (!plantId) {
      return res.status(403).send({ error: 'Missing plantId' });
    }

    try {
      const deletedCount = await mongo.deletePlant(plantId, userId, logger);
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
