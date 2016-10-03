import mongo from '../db/mongo';
import * as tokenCheck from '../config/token-check';
import validators from '../../app/models';

const {
  plant: validatePlant,
} = validators;

const {requireToken} = tokenCheck;

const logger = require('../logging/logger').create('api-plant');

export default (app) => {

  // Plant CRUD operations
  // Plant Create
  app.post('/api/plant', requireToken, (req, res) => {
    logger.trace('POST /api/plant:', {'req.body': req.body});

    const plant = req.body;
    plant.userId = req.user._id;
    if(plant.purchasedDate) {
      plant.purchasedDate = parseInt(plant.purchasedDate, 10);
    }
    if(plant.plantedDate) {
      plant.plantedDate = parseInt(plant.plantedDate, 10);
    }
    const isNew = true;

    validatePlant(plant, {isNew}, (err, transformed) => {
      if(err) {
        // logger.trace(`response POST /api/plant: 400`, err);
        // TODO: Log this. Shouldn't happen unless someone is hacking
        return res.status(400).send(err);
      }

      mongo.createPlant(transformed, (createPlantErr, result) => {
        if(createPlantErr) {
          return res.status(500).send(createPlantErr);
        }
        return res.status(200).send(result);
      });
    });
  });

  // Plant Read
  app.get('/api/plant/:plantId', (req, res) => {

    const plantId = req.params.plantId;
    if(!plantId) {
      return res.status(404).send({error: `Missing plantId in request url: ${req.path}`});
    }

    mongo.getPlantById(plantId, (err, result) => {
      logger.trace(`response /api/plant/${plantId}:`, result);
      if(err) {
        return res.status(500).send({error: err.message});
      } else {
        if(result) {
          return res.status(200).send(result);
        } else {
          return res.status(404).send({error: 'missing'});
        }
      }
    });
  });

  // Plant Update
  app.put('/api/plant', requireToken, (req, res) => {
    // logger.trace('PUT /api/plant req.user:', req.user && req.user.name);

    const plant = req.body;
    plant.userId = req.user._id;
    if(plant.purchasedDate) {
      plant.purchasedDate = parseInt(plant.purchasedDate, 10);
    }
    if(plant.plantedDate) {
      plant.plantedDate = parseInt(plant.plantedDate, 10);
    }
    const isNew = false;

    validatePlant(plant, {isNew}, (err, transformed) => {
      if(err) {
        logger.trace('response PUT /api/plant: 400', err);
        return res.status(400).send(err);
      }

      mongo.updatePlant(transformed, (updatePlantErr, result) => {
        if(updatePlantErr) {
          return res.status(500).send(updatePlantErr);
        }
        return res.status(200).send(result);
      });
    });
  });

  // Plant Delete
  app.delete('/api/plant/:plantId', requireToken, (req, res) => {
    const {plantId} = req.params;

    if(!plantId) {
      return res.status(403).send({error: 'Missing plantId'});
    }

    const userId = req.user._id;

    mongo.deletePlant(plantId, userId, (plantDeleteErr, deletedCount) => {
      if(plantDeleteErr) {
        return res.status(500).send({Error: plantDeleteErr.message});
      }
      if(deletedCount) {
        return res.status(200).send({message: 'Deleted'});
      } else {
        return res.status(404).send({message: 'Not Found'});
      }
    });
  });

};
