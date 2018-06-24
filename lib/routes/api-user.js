const mongo = require('../db/mongo')();

const moduleName = 'routes/api-user';

module.exports = (app) => {
  app.get('/api/user/:userId', async (req, res) => {
    const { logger } = req;
    const { userId } = req.params || {};
    if (!userId) {
      logger.error({ moduleName, msg: 'No userId in /api/user GET', 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no user id' });
    }

    try {
      const response = await mongo.getUserById(userId, logger);
      return res.send(response);
    } catch (err) {
      logger.error({
        moduleName, route: 'GET /api/user/:userId', req, err, userId,
      });
      return res.status(500).send({ success: false, message: 'server error' });
    }
  });

  app.get('/api/users', async (req, res) => {
    const { logger } = req;
    try {
      const response = await mongo.getAllUsers(logger);
      res.send(response);
    } catch (err) {
      logger.error({
        moduleName, route: 'GET /api/users', req, err,
      });
      res.status(500).send({ success: false, message: 'server error' });
    }
  });
};
