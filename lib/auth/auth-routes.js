const passport = require('@passport-next/passport');

const moduleName = 'routes/auth';
const { sessionKey } = require('../constants');

function auth(app) {
  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/google', passport.authenticate('google', {
    scope: 'email',
  }));

  function authenticate(req, res, next, strategy) {
    const { logger } = req;
    try {
      const f = passport.authenticate(`${strategy}`, (passportAuthenticateError, user, info) => {
        if (passportAuthenticateError) {
          logger.error({
            moduleName,
            msg: `app.get(/auth/${strategy}/callback) error`,
            err: passportAuthenticateError,
            user,
            info,
          });
          return res.status(500).send({ message: `An error in /auth/${strategy}/callback` });
        }

        if (!user) {
          logger.warn({
            moduleName,
            msg: `No user found in /auth/${strategy}/callback`,
          });
          return res.json(401, { error: 'Failed to authenticate user.' });
        }

        // req.logIn and req.login resolve to same function
        return req.logIn(user, (err2) => {
          if (err2) {
            return logger.error({
              moduleName,
              method: 'req.logIn',
              err: err2,
            }, { res, code: 500 });
          }

          logger.trace({
            moduleName,
            msg: `authenticate complete with ${strategy} auth, redirecting to /u`,
            user,
          });
          return res.redirect('/');
        });
      });

      f(req, res, next);
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
    res.clearCookie(sessionKey);
    res.redirect('/');
  });
}

module.exports = { auth };
