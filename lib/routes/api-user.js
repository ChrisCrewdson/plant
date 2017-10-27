const mongo = require('../db/mongo')();

const logger = require('../logging/logger').create('api-user');

module.exports = (app) => {
  app.get('/api/user/:userId', async (req, res) => {
    const { userId } = req.params || {};
    if (!userId) {
      logger.error('No userId in /api/user GET', { 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no user id' });
    }

    try {
      const response = await mongo.getUserById(userId);
      return res.send(response);
    } catch (e) {
      return res.status(500).send({ success: false, message: 'server error' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const response = await mongo.getAllUsers();
      res.send(response);
    } catch (e) {
      res.status(500).send({ success: false, message: 'server error' });
    }
  });
};
