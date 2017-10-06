const mongo = require('../db/mongo');

const logger = require('../logging/logger').create('api-user');

module.exports = (app) => {
  app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params || {};
    if (!userId) {
      logger.error('No userId in /api/user GET', { 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no user id' });
    }

    return mongo.getUserById(userId)
      .then(response => res.send(response))
      .catch(() => res.status(500).send({ success: false, message: 'server error' }));
  });

  app.get('/api/users', (req, res) => {
    mongo.getAllUsers()
      .then(response => res.send(response))
      .catch(() => res.status(500).send({ success: false, message: 'server error' }));
  });
};
