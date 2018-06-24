const _ = require('lodash');
const jwt = require('jwt-simple');
const mongoDb = require('../db/mongo')();

const moduleName = 'routes/auth';

const tokenSecret = process.env.PLANT_TOKEN_SECRET;

function auth(app, passport) {
  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/google', passport.authenticate('google', {
    scope: 'email',
  }));

  app.get('/auth/with', (req, res) => {
    const { code = '' } = req.query || {};
    let user;
    try {
      user = jwt.decode(code, tokenSecret);
    } catch (err) {
      const { logger } = req;
      logger.info({ moduleName, msg: `Failed to jwt.decode(${code}, tokenSecret)`, err });
    }

    if (!user) {
      return res.status(401).send({
        code: req.query.code,
        error: 'Failed to decode',
      });
    }

    const responseUser = _.pick(user, ['_id', 'name', 'locationIds']);
    responseUser.jwt = req.query.code;
    if (user.locationIds && user.locationIds.length) {
      if (!user.locationIds[0]._id) {
        // TODO: Remove this once confirmed that this is not a problem.
        // eslint-disable-next-line no-console
        console.error('Missing user.locationIds[0]._id for user:', user.locationIds);
      }
      responseUser.activeLocationId = user.locationIds[0]._id;
    }

    return res.status(200).send(responseUser);
  });

  // Handle dev-mode login and create or find user Granny Smith
  app.get('/auth/dev', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).send('Not allowed in production');
    }

    const { logger } = req;
    const createdDate = new Date();
    const newUser = {
      facebook: {
        id: '1234554321',
      },
      name: 'Granny Smith',
      email: 'granny.smith@apple-orchard.com',
      createdAt: createdDate,
      updatedAt: createdDate,
    };
    try {
    // find the user in the database based on their facebook id
      const user = await mongoDb.findOrCreateUser(newUser, logger);
      if (!user) {
        logger.warn({ moduleName, msg: 'app.get(/auth/dev) no user' });
        return res.json(401, { error: 'Could not find or create user' });
      }

      // user has authenticated correctly thus we create a JWT token
      const token = jwt.encode(user, tokenSecret);
      return res.redirect(`/auth/token?jwt=${token}`);
    } catch (err) {
      logger.error({ moduleName, msg: 'create/find user error:', err });
      // Okay to send full error here because running in development mode
      // i.e. we don't get to this point in production
      return res.status(500).send(err);
    }
  });

  function authenticate(req, res, next, strategy) {
    const { logger } = req;
    try {
      passport.authenticate(`${strategy}`, (passportAuthenticateError, user /* , info */) => {
        if (passportAuthenticateError) {
          logger.error({
            moduleName,
            msg: `app.get(/auth/${strategy}/callback) error`,
            err: passportAuthenticateError,
            user,
          });
          return res.status(500).send({ message: `An error in /auth/${strategy}/callback` });
        }

        if (!user) {
          return res.json(401, { error: 'Failed to authenticate user.' });
        }

        // user has authenticated correctly thus we create a JWT token
        const token = jwt.encode(user, tokenSecret);
        // logger.trace('moduleName,jwt created and returned to client');
        return res.redirect(`/auth/token?jwt=${token}`);
      })(req, res, next);
    } catch (passportAuthenticateError) {
      logger.error({
        moduleName,
        msg: `Passport.authenticate ${strategy} threw error`,
        err: passportAuthenticateError,
      });
      res.status(500).send('Unknown server error during login');
    }
  }

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback', (req, res, next) => {
    authenticate(req, res, next, 'facebook');
  });

  // handle the callback after google has authenticated the user
  app.get('/auth/google/callback', (req, res, next) => {
    authenticate(req, res, next, 'google');
  });

  // route for logging out
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
}

module.exports = { auth };
