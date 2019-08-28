import { Application } from 'express';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const auth = require('../auth/auth-routes');
const client = require('./client');
const locationsApi = require('./api-locations');
const noteApi = require('./api-note');
const plantApi = require('./api-plant');
const plantsApi = require('./api-plants');
const userApi = require('./api-user');
const rss = require('./rss');

const shortMap: Dictionary<string> = {
  guy: '/location/guy-ellis-yard/5851d7d52967c2153ab6c856',
  prea: '/location/preashni-aheer-yard/5851d7d52967c2153ab6c857',
};

/**
 * Short Url alias for location - start off with hard coding a single one
 */
const shortUrl = (app: Application) => {
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
 */
async function index(app: Application): Promise<any> {
  client(app);
  auth.auth(app);
  locationsApi(app);
  noteApi(app);
  plantApi(app);
  plantsApi(app);
  userApi(app);
  rss(app);
  shortUrl(app);
}

module.exports = { index };
