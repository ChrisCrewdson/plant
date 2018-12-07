const auth = require('../auth/auth-routes');
const client = require('./client');
const locationsApi = require('./api-locations');
const noteApi = require('./api-note');
const plantApi = require('./api-plant');
const plantsApi = require('./api-plants');
const userApi = require('./api-user');
const rss = require('./rss');
const gql = require('./gql');

/** @type {Dictionary<string>} */
const shortMap = {
  guy: '/location/guy-ellis-yard/5851d7d52967c2153ab6c856',
  prea: '/location/preashni-aheer-yard/5851d7d52967c2153ab6c857',
};

/**
 * Short Url alias for location - start off with hard coding a single one
 * @param {import("express").Application} app - Express application
 */
const shortUrl = (app) => {
  // The 's' is for short.
  // Idea will be to allow people to add their own short url at some point
  // in the future and this will be a unique field in the location collection
  app.get('/s/:short', (req, res) => {
    const { short } = req.params;
    const url = shortMap[short] || shortMap.guy;
    return res.redirect(url);
  });
};

/**
 * Short Url alias for location - start off with hard coding a single one
 * @param {import("express").Application} app - Express application
 * @returns {Promise}
 */
async function index(app) {
  client(app);
  auth.auth(app);
  locationsApi(app);
  noteApi(app);
  plantApi(app);
  plantsApi(app);
  userApi(app);
  rss(app);
  shortUrl(app);
  await gql(app);
}

module.exports = { index };
