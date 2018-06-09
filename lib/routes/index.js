const auth = require('./auth');
const client = require('./client');
const locationsApi = require('./api-locations');
const noteApi = require('./api-note');
const plantApi = require('./api-plant');
const plantsApi = require('./api-plants');
const userApi = require('./api-user');
const rss = require('./rss');

/**
 * Short Url alias for location - start off with hard coding a single one
 * @param {Object} app
 */
const shortUrl = (app) => {
  // The 's' is for short.
  // Idea will be to allow people to add their own short url at some point
  // in the future and this will be a unique field in the location collection
  app.get('/s/guy',
    (req, res) => res.redirect('/location/guy-ellis-yard/5851d7d52967c2153ab6c856'));
};

function index(app, passport) {
  client(app);
  auth.auth(app, passport);
  locationsApi(app);
  noteApi(app);
  plantApi(app);
  plantsApi(app);
  userApi(app);
  rss(app);
  shortUrl(app);
}

module.exports = { index };
