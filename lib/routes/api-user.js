const mongo = require('../db/mongo')();
const { sessionKey } = require('../constants');

const moduleName = 'routes/api-user';

module.exports = (app) => {
  app.get('/api/logout', (req, res) => {
    const { logger } = req;
    logger.trace({ moduleName, method: 'GET /api/logout' });

    if (res.clearCookie) {
      res.clearCookie(sessionKey);
    } else {
      logger.error({
        moduleName,
        msg: 'Missing clearCookie() method on res object',
      });
    }

    if (req.logout) {
      req.logout();
    } else {
      logger.error({
        moduleName,
        msg: 'Missing logout() method on req object',
      });
    }

    return res.status(200).send({ success: true });
  });

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
